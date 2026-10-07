import confetti from 'canvas-confetti';
import { brand, projectTypes } from '../data/portfolioData';
import { h, sectionHead, shapeSvg } from '../lib/dom';
import { sound } from '../lib/sound';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface Field {
  name: string;
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  error: HTMLElement;
  validate: (value: string) => string;
}

function burst(origin: HTMLElement): void {
  const rect = origin.getBoundingClientRect();
  const triangle = confetti.shapeFromPath({ path: 'M0 10 L5 0 L10 10z' });
  void confetti({
    particleCount: 140,
    spread: 75,
    startVelocity: 42,
    ticks: 220,
    gravity: 1.1,
    scalar: 1.3,
    flat: true,
    shapes: ['square', 'circle', triangle],
    colors: ['#D62718', '#F2B705', '#1F4E9E', '#111111'],
    origin: {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    },
    disableForReducedMotion: true,
  });
}

function copyButton(): HTMLButtonElement {
  const btn = h('button', { class: 'btn btn--small copy-email', type: 'button' }, 'Copy email');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(brand.email);
      btn.textContent = 'Copied ✓';
    } catch {
      btn.textContent = 'Copy failed: select the address';
    }
    window.setTimeout(() => (btn.textContent = 'Copy email'), 2000);
  });
  return btn;
}

export function renderContact(): HTMLElement {
  const make = (
    name: string,
    label: string,
    control: Field['input'],
    validate: Field['validate'],
  ): { field: Field; wrap: HTMLElement } => {
    const id = `contact-${name}`;
    const error = h('p', { class: 'field__error', id: `${id}-error` });
    control.id = id;
    control.name = name;
    control.classList.add('field__input');
    control.setAttribute('aria-describedby', `${id}-error`);
    return {
      field: { name, input: control, error, validate },
      wrap: h('div', { class: `field field--${name}` }, h('label', { class: 'field__label', for: id }, label), control, error),
    };
  };

  const name = make('name', 'Name', h('input', { type: 'text', autocomplete: 'name', maxlength: '120', required: true }), (v) =>
    v.trim().length >= 2 ? '' : 'Tell us your name.',
  );
  const email = make('email', 'Email', h('input', { type: 'email', autocomplete: 'email', maxlength: '254', required: true }), (v) =>
    EMAIL_RE.test(v.trim()) ? '' : 'Enter a valid email address.',
  );
  const type = make(
    'type',
    'Project type',
    h(
      'select',
      { required: true },
      h('option', { value: '' }, 'Select one'),
      ...projectTypes.map((t) => h('option', { value: t }, t)),
    ),
    (v) => (v ? '' : 'Pick the closest project type.'),
  );
  const message = make(
    'message',
    'Brief',
    h('textarea', { rows: '5', maxlength: '4000', required: true, placeholder: 'What are we building, and by when?' }),
    (v) => (v.trim().length >= 20 ? '' : 'A couple of sentences please (20+ characters).'),
  );
  const fields = [name.field, email.field, type.field, message.field];

  const submit = h(
    'button',
    { class: 'btn btn--red btn--magnetic', type: 'submit' },
    h('span', { class: 'btn__inner' }, 'Hire the team ▸'),
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
    type.wrap,
    message.wrap,
    h('div', { class: 'contact__submit' }, submit, h('p', { class: 'mono-label' }, 'Opens your mail app with the brief filled in')),
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

    const subject = `Project brief: ${type.field.input.value} — ${name.field.input.value.trim()}`;
    const body = [
      `Name: ${name.field.input.value.trim()}`,
      `Email: ${email.field.input.value.trim()}`,
      `Type: ${type.field.input.value}`,
      '',
      message.field.input.value.trim(),
    ].join('\n');
    const mailto = `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    burst(submit);
    sound.success();
    result.replaceChildren(
      h(
        'div',
        { class: 'transmission' },
        h('p', { class: 'transmission__title' }, 'Transmission prepared'),
        h('div', { class: 'transmission__bar', 'aria-hidden': 'true' }, h('span')),
        h(
          'p',
          {},
          'Your mail app should open with the brief. If it did not, ',
          h('a', { href: mailto }, 'open the email draft'),
          ' or copy our address.',
        ),
      ),
    );
    window.location.href = mailto;
  });

  return h(
    'section',
    { id: 'contact', class: 'section contact', 'aria-labelledby': 'contact-title' },
    h(
      'div',
      { class: 'container' },
      sectionHead('06', 'Contact', 'Initiate Project'),
      h(
        'div',
        { class: 'contact__grid' },
        h(
          'div',
          { class: 'contact__pitch' },
          h('p', { class: 'contact__big' }, 'Build something', h('br'), 'worth shipping.'),
          h(
            'p',
            { class: 'contact__lede' },
            'Send a brief and all three of us read it. You get a reply with questions, a rough plan and who would own what.',
          ),
          h(
            'div',
            { class: 'contact__direct' },
            h('p', { class: 'mono-label' }, 'Direct line'),
            h('a', { class: 'contact__email', href: `mailto:${brand.email}` }, brand.email),
            copyButton(),
          ),
          h(
            'div',
            { class: 'contact__shapes', 'aria-hidden': 'true' },
            shapeSvg('square', 'blue'),
            shapeSvg('circle', 'yellow'),
            shapeSvg('triangle', 'red'),
          ),
        ),
        form,
      ),
    ),
  );
}
