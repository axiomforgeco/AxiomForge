import { brand, chapterCount } from '../data/portfolioData';
import { chapterLabel, h, maskLines, shapeSvg } from '../lib/dom';
import { clean, RECIPIENT, sendContact, type ContactMessage } from '../lib/mail';
import { EASE, gsap, isReduced } from '../lib/motion';
import { sound } from '../lib/sound';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS = { name: 100, email: 254, subject: 150, message: 5000 };
/** After a confirmed send, the form rests this long before it will send again. */
const COOLDOWN_MS = 30000;

interface Field {
  input: HTMLInputElement | HTMLTextAreaElement;
  error: HTMLElement;
  validate: (value: string) => string;
}

function copyButton(): HTMLButtonElement {
  const btn = h('button', { class: 'link-btn meta', type: 'button', 'data-cursor': 'Copy' }, 'Copy address');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(brand.email);
      btn.textContent = 'Copied';
    } catch {
      btn.textContent = 'Copy failed — select the address';
    }
    window.setTimeout(() => (btn.textContent = 'Copy address'), 2000);
  });
  return btn;
}

export function renderContact(): HTMLElement {
  const make = (name: string, label: string, control: Field['input'], validate: Field['validate']) => {
    const id = `contact-${name}`;
    const error = h('p', { class: 'field__error', id: `${id}-error` });
    control.id = id;
    control.name = name;
    control.classList.add('field__input');
    control.setAttribute('aria-describedby', `${id}-error`);
    return {
      field: { input: control, error, validate } satisfies Field,
      wrap: h('div', { class: `field field--${name}` }, h('label', { class: 'field__label meta', for: id }, label), control, error),
    };
  };

  const tooLong = (max: number) => `Keep it under ${max.toLocaleString('en')} characters.`;
  const name = make('name', 'Name', h('input', { type: 'text', autocomplete: 'name', maxlength: String(LIMITS.name), required: true }), (v) => {
    const s = v.trim();
    if (s.length < 2) return 'Tell us your name.';
    return s.length > LIMITS.name ? tooLong(LIMITS.name) : '';
  });
  const email = make(
    'email',
    'Email',
    h('input', { type: 'email', autocomplete: 'email', inputmode: 'email', maxlength: String(LIMITS.email), required: true }),
    (v) => (EMAIL_RE.test(v.trim()) && v.trim().length <= LIMITS.email ? '' : 'Enter a valid email address.'),
  );
  const subject = make('subject', 'Subject', h('input', { type: 'text', maxlength: String(LIMITS.subject), required: true }), (v) => {
    const s = v.trim();
    if (s.length < 2) return 'Add a subject.';
    return s.length > LIMITS.subject ? tooLong(LIMITS.subject) : '';
  });
  const message = make(
    'message',
    'Message',
    h('textarea', { 'data-lenis-prevent': true, rows: '4', maxlength: String(LIMITS.message), required: true, placeholder: 'What are we building, and by when?' }),
    (v) => {
      const s = v.trim();
      if (s.length < 10) return 'Write a little more (10+ characters).';
      return s.length > LIMITS.message ? tooLong(LIMITS.message) : '';
    },
  );
  const fields = [name.field, email.field, subject.field, message.field];

  // Honeypot: invisible to people, irresistible to form-filling bots.
  const trap = h('input', { type: 'text', name: 'company', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' });
  const honeypot = h('div', { class: 'contact__trap', 'aria-hidden': 'true' }, h('label', {}, 'Company', trap));

  // Auto-grow fallback for browsers without CSS field-sizing.
  if (!CSS.supports('field-sizing', 'content')) {
    const area = message.field.input as HTMLTextAreaElement;
    area.addEventListener('input', () => {
      area.style.height = 'auto';
      area.style.height = `${area.scrollHeight}px`;
    });
  }

  const label = h('span', { class: 'btn__inner' }, 'Send message');
  const submit = h('button', { class: 'btn btn--ink btn--magnetic', type: 'submit', 'data-cursor': 'Send' }, label);
  // Status is announced to screen readers; success only ever follows a confirmed send.
  const result = h('div', { class: 'contact__result', role: 'status', 'aria-live': 'polite' });

  const check = (f: Field): boolean => {
    const msg = f.validate(f.input.value);
    f.error.textContent = msg;
    f.input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  };
  fields.forEach((f) => {
    f.input.addEventListener('blur', () => {
      if (f.input.value) check(f);
    });
    f.input.addEventListener('input', () => {
      if (f.input.getAttribute('aria-invalid') === 'true') check(f);
    });
  });

  const form = h(
    'form',
    { class: 'contact__form', novalidate: true, 'aria-label': 'Contact AxiomForge' },
    h('div', { class: 'contact__row' }, name.wrap, email.wrap),
    subject.wrap,
    message.wrap,
    honeypot,
    h('div', { class: 'contact__submit' }, submit, h('p', { class: 'meta' }, `Delivered to ${RECIPIENT}`)),
    result,
  );

  let sending = false;
  let restUntil = 0;
  const setSending = (on: boolean): void => {
    sending = on;
    submit.disabled = on;
    form.setAttribute('aria-busy', String(on));
    label.textContent = on ? 'Sending…' : 'Send message';
  };

  const failure = (text: string): void => {
    result.replaceChildren(
      h(
        'div',
        { class: 'sent sent--error' },
        h('p', { class: 'sent__title' }, 'Message not sent.'),
        h('p', {}, text, ' You can also write directly to ', h('a', { href: `mailto:${RECIPIENT}` }, RECIPIENT), '.'),
      ),
    );
    sound.error();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return; // no duplicate submissions
    const invalid = fields.filter((f) => !check(f));
    if (invalid.length) {
      sound.error();
      invalid[0]?.input.focus();
      return;
    }
    if (Date.now() < restUntil) {
      failure('A message was just sent. Please wait a moment before sending another.');
      return;
    }
    // A filled honeypot is a bot: nothing is sent, and nothing claims it was.
    if (trap.value) {
      failure('Please try again.');
      return;
    }

    const msg: ContactMessage = {
      name: clean(name.field.input.value),
      email: clean(email.field.input.value),
      subject: clean(subject.field.input.value),
      message: clean(message.field.input.value),
    };
    setSending(true);
    result.replaceChildren(h('p', { class: 'meta' }, 'Sending…'));
    const sent = await sendContact(msg);
    setSending(false);

    if (!sent.ok) {
      failure(
        sent.reason === 'timeout'
          ? 'The connection timed out. Please try again.'
          : sent.reason === 'network'
            ? 'Check your connection and please try again.'
            : 'Please try again.',
      );
      return;
    }

    // Confirmed by the provider: clear the form and show it, geometrically.
    restUntil = Date.now() + COOLDOWN_MS;
    form.reset();
    fields.forEach((f) => f.input.setAttribute('aria-invalid', 'false'));
    const glyph = h(
      'div',
      { class: 'sent__glyph', 'aria-hidden': 'true' },
      shapeSvg('square', 'blue'),
      shapeSvg('circle', 'yellow'),
      shapeSvg('triangle', 'red'),
    );
    result.replaceChildren(
      h('div', { class: 'sent' }, glyph, h('p', { class: 'sent__title' }, 'Message sent.'), h('p', {}, 'Thank you. All three of us will read it, and we will reply by email.')),
    );
    sound.success();
    if (!isReduced()) {
      gsap.from(glyph.children, { y: -40, rotation: 90, stagger: 0.08, duration: 0.5, ease: EASE.mechanical });
    }
  });

  return h(
    'section',
    { id: 'contact', class: 'section contact', 'aria-labelledby': 'contact-title', 'data-tone': 'yellow', 'data-from': 'ivory', 'data-wipe': 'circle' },
    h('div', { class: 'plane', 'aria-hidden': 'true' }),
    h(
      'div',
      { class: 'container' },
      chapterLabel('contact', 'Contact', chapterCount),
      h(
        'div',
        { class: 'contact__statement', 'data-velocity': 'stretch' },
        maskLines('h2', ["Let's build", 'something', 'worth breaking.'], { id: 'contact-title', class: 'display contact__title' }),
      ),
      h(
        'div',
        { class: 'contact__grid' },
        h(
          'div',
          { class: 'contact__aside' },
          h('p', { class: 'lead' }, 'Send a message. All three of us read it. You get questions, a rough plan and who would own what.'),
          h(
            'div',
            { class: 'contact__direct' },
            h('a', { class: 'contact__email', href: `mailto:${brand.email}`, 'data-cursor': 'Write' }, brand.email),
            copyButton(),
          ),
        ),
        form,
      ),
    ),
  );
}
