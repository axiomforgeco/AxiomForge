import { brand, chapterCount } from '../data/portfolioData';
import { chapterLabel, h, maskLines, shapeSvg } from '../lib/dom';
import { EASE, gsap, isReduced } from '../lib/motion';
import { sound } from '../lib/sound';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface Field {
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
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

  const name = make('name', 'Name', h('input', { type: 'text', autocomplete: 'name', maxlength: '120', required: true }), (v) =>
    v.trim().length >= 2 ? '' : 'Tell us your name.',
  );
  const email = make('email', 'Email', h('input', { type: 'email', autocomplete: 'email', maxlength: '254', required: true }), (v) =>
    EMAIL_RE.test(v.trim()) ? '' : 'Enter a valid email address.',
  );
  const message = make(
    'message',
    'Brief',
    h('textarea', { rows: '4', maxlength: '4000', required: true, placeholder: 'What are we building, and by when?' }),
    (v) => (v.trim().length >= 20 ? '' : 'A couple of sentences, please (20+ characters).'),
  );
  const fields = [name.field, email.field, message.field];

  const submit = h(
    'button',
    { class: 'btn btn--ink btn--magnetic', type: 'submit', 'data-cursor': 'Send' },
    h('span', { class: 'btn__inner' }, 'Send brief'),
  );
  const result = h('div', { class: 'contact__result', 'aria-live': 'polite' });

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
    { class: 'contact__form', novalidate: true, 'aria-label': 'Project brief' },
    h('div', { class: 'contact__row' }, name.wrap, email.wrap),
    message.wrap,
    h('div', { class: 'contact__submit' }, submit, h('p', { class: 'meta' }, 'Opens your mail app with the brief filled in')),
    result,
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const invalid = fields.filter((f) => !check(f));
    if (invalid.length) {
      sound.error();
      invalid[0]?.input.focus();
      return;
    }

    const subject = `Project brief — ${name.field.input.value.trim()}`;
    const body = [
      `Name: ${name.field.input.value.trim()}`,
      `Email: ${email.field.input.value.trim()}`,
      '',
      message.field.input.value.trim(),
    ].join('\n');
    const mailto = `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Success is geometric: the three primitives snap into a row.
    const glyph = h(
      'div',
      { class: 'sent__glyph', 'aria-hidden': 'true' },
      shapeSvg('square', 'blue'),
      shapeSvg('circle', 'yellow'),
      shapeSvg('triangle', 'red'),
    );
    result.replaceChildren(
      h(
        'div',
        { class: 'sent' },
        glyph,
        h('p', { class: 'sent__title' }, 'Brief ready.'),
        h(
          'p',
          {},
          'Your mail app should open with everything filled in. If it did not, ',
          h('a', { href: mailto }, 'open the draft'),
          ' or write to ',
          h('a', { href: `mailto:${brand.email}` }, brand.email),
          '.',
        ),
      ),
    );
    sound.success();
    if (!isReduced()) {
      gsap.from(glyph.children, { y: -40, rotation: 90, stagger: 0.08, duration: 0.5, ease: EASE.mechanical });
    }
    window.location.href = mailto;
  });

  return h(
    'section',
    { id: 'contact', class: 'section contact', 'aria-labelledby': 'contact-title' },
    h(
      'div',
      { class: 'container' },
      chapterLabel('contact', 'Contact', chapterCount),
      h(
        'div',
        { class: 'contact__statement', 'data-velocity': 'stretch' },
        maskLines('h2', ["Let's build", 'something', 'useful.'], { id: 'contact-title', class: 'display contact__title' }),
      ),
      h(
        'div',
        { class: 'contact__grid' },
        h(
          'div',
          { class: 'contact__aside' },
          h('p', { class: 'lead' }, 'Send a brief. All three of us read it. You get questions, a rough plan and who would own what.'),
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
