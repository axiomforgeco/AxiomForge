import { chapterCount, probeEndpoints, testCards, type ProbeEndpoint } from '../data/portfolioData';
import { chapterLabel, h, maskLines, shapeSvg } from '../lib/dom';
import { EASE, gsap, isReduced } from '../lib/motion';
import { sound } from '../lib/sound';

const rand = (min: number, max: number): number => min + Math.random() * (max - min);
const hex = (len: number): string =>
  Array.from(crypto.getRandomValues(new Uint8Array(len)), (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, len);

/* ---------- Experiment 01: API probe ---------- */

function renderProbe(): HTMLElement {
  const recent: number[] = [];

  const targets = h(
    'fieldset',
    { class: 'targets targets--inline' },
    h('legend', { class: 'meta' }, 'Endpoint'),
    ...probeEndpoints.map((ep, i) =>
      h(
        'label',
        { class: 'target', 'data-cursor': 'Select' },
        h('input', { type: 'radio', name: 'probe', value: ep.id, checked: i === 0 }),
        h('span', { class: 'target__method meta' }, ep.method),
        h('span', { class: 'target__path' }, ep.path),
      ),
    ),
  );

  const send = h('button', { class: 'btn', type: 'button', 'data-cursor': 'Probe' }, 'Send probe');
  const code = h('span', { class: 'probe__code numeral' }, '000');
  const ms = h('span', { class: 'probe__ms' }, '0.00');
  const text = h('span', { class: 'probe__text meta' }, 'Idle');
  const metaLine = h('p', { class: 'probe__line meta' }, 'Awaiting probe');
  const headersOut = h('code', {}, '—');
  const bodyOut = h('code', {}, '—');
  const live = h('p', { class: 'visually-hidden', 'aria-live': 'polite' });

  const selected = (): ProbeEndpoint =>
    probeEndpoints.find((ep) => ep.id === targets.querySelector<HTMLInputElement>('input:checked')?.value) ??
    probeEndpoints[0]!;

  send.addEventListener('click', () => {
    const ep = selected();
    const now = performance.now();
    while (recent.length && now - recent[0]! > 4000) recent.shift();
    recent.push(now);
    // Shows the rate limiter: more than 5 probes in 4 seconds returns a 429.
    const limited = recent.length > 5;
    const latency = limited ? rand(0.2, 0.6) : rand(...ep.latencyMs);
    const status = limited ? 429 : 200;
    const requestId = `req_${hex(12)}`;
    const headers: Record<string, string> = {
      'content-type': 'application/json; charset=utf-8',
      'x-request-id': requestId,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'server-timing': `app;dur=${latency.toFixed(2)}`,
      'ratelimit-remaining': String(Math.max(0, 5 - recent.length)),
      ...(limited ? { 'retry-after': '4' } : {}),
    };
    const body = limited ? { error: { code: 'RATE_LIMITED', message: 'Too many probes. Retry in 4s.' } } : ep.body;

    code.textContent = String(status);
    text.textContent = limited ? 'Too many requests' : 'OK';
    code.closest('.probe')?.setAttribute('data-status', String(status));
    metaLine.textContent = `${ep.method} ${ep.path} / ${requestId} / ${headers['ratelimit-remaining'] ?? '0'} left`;
    headersOut.textContent = JSON.stringify(headers, null, 2);
    bodyOut.textContent = JSON.stringify(body, null, 2);
    live.textContent = `${ep.method} ${ep.path} returned ${status} in ${latency.toFixed(2)} milliseconds.`;
    if (limited) sound.error();
    else sound.tick();

    if (isReduced()) {
      ms.textContent = latency.toFixed(2);
      return;
    }
    const counter = { v: 0 };
    gsap.to(counter, {
      v: latency,
      duration: 0.4,
      ease: 'steps(8)',
      onUpdate: () => {
        ms.textContent = counter.v.toFixed(2);
      },
    });
    gsap.fromTo(code, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: EASE.out });
    gsap.fromTo([text, metaLine], { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.08, delay: 0.45, ease: 'power2.out' });
  });

  return h(
    'article',
    { class: 'exp', 'aria-labelledby': 'exp-probe' },
    h(
      'header',
      { class: 'exp__head' },
      h('p', { class: 'meta' }, 'Experiment 01 / Simulated in your browser'),
      h('h3', { id: 'exp-probe', class: 'exp__title' }, 'API Probe'),
    ),
    targets,
    send,
    h(
      'div',
      { class: 'probe', 'aria-hidden': 'true' },
      code,
      h('p', { class: 'probe__latency' }, ms, h('span', { class: 'probe__unit' }, 'ms')),
      text,
    ),
    metaLine,
    h(
      'details',
      { class: 'probe__details' },
      h('summary', { class: 'meta', 'data-cursor': 'Inspect' }, 'Headers + body'),
      h('pre', { class: 'code', tabindex: '0', 'data-lenis-prevent': true }, headersOut),
      h('pre', { class: 'code', tabindex: '0', 'data-lenis-prevent': true }, bodyOut),
    ),
    live,
    h('p', { class: 'exp__note' }, 'A mock API. More than five probes in four seconds meets the rate limiter.'),
  );
}

/* ---------- Experiment 02: test payment ---------- */

const digits = (value: string): string => value.replace(/\D/g, '');

function luhn(num: string): boolean {
  let sum = 0;
  for (let i = 0; i < num.length; i++) {
    let d = Number(num[num.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return num.length >= 12 && sum % 10 === 0;
}

function field(id: string, label: string, attrs: Record<string, string | boolean>) {
  const error = h('p', { class: 'field__error', id: `${id}-error` });
  const input = h('input', { id, class: 'field__input', 'aria-describedby': `${id}-error`, autocomplete: 'off', ...attrs });
  return {
    wrap: h('div', { class: 'field' }, h('label', { for: id, class: 'field__label meta' }, label), input, error),
    input,
    error,
  };
}

function renderPayment(): HTMLElement {
  const AMOUNT = '49.00';
  // Deliberately not cc-* names or autocomplete tokens, so browsers never offer saved real cards.
  const card = field('sim-card', 'Test card number', { inputmode: 'numeric', placeholder: '4242 4242 4242 4242', maxlength: '23', spellcheck: false });
  const exp = field('sim-exp', 'Expiry MM/YY', { inputmode: 'numeric', placeholder: '12/34', maxlength: '5' });
  const cvc = field('sim-cvc', 'CVC', { inputmode: 'numeric', placeholder: '123', maxlength: '4' });

  const objState = h('span', { class: 'payobj__state meta' }, 'Awaiting card');
  const object = h(
    'div',
    { class: 'payobj', 'data-state': 'idle' },
    h('div', { class: 'payobj__circle', 'aria-hidden': 'true' }, shapeSvg('circle', 'yellow')),
    h('div', { class: 'payobj__bar', 'aria-hidden': 'true' }),
    h('p', { class: 'payobj__mode meta' }, 'Test mode'),
    h('p', { class: 'payobj__amount' }, AMOUNT, h('span', { class: 'payobj__ccy meta' }, 'USD')),
    objState,
  );

  const begin = h(
    'button',
    { class: 'btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'payment-form', 'data-cursor': 'Begin' },
    'Begin test payment',
  );
  const fill = h('button', { class: 'link-btn meta', type: 'button' }, 'Use 4242 (succeeds)');
  const decline = h('button', { class: 'link-btn meta', type: 'button' }, 'Use 0002 (declines)');
  const pay = h('button', { class: 'btn btn--ink', type: 'submit', 'data-cursor': 'Pay' }, `Pay ${AMOUNT} (test)`);
  const receipt = h('div', { class: 'receipt-slot', 'aria-live': 'polite' });

  const form = h(
    'form',
    { class: 'payment', id: 'payment-form', novalidate: true, hidden: true },
    h(
      'p',
      { class: 'payment__warning' },
      'Nothing is charged and nothing leaves this page. Only Stripe test numbers are accepted. Never enter a real card.',
    ),
    h('div', { class: 'payment__quick' }, fill, decline),
    card.wrap,
    h('div', { class: 'payment__row' }, exp.wrap, cvc.wrap),
    pay,
  );

  begin.addEventListener('click', () => {
    const opening = form.hidden;
    form.hidden = !opening;
    begin.setAttribute('aria-expanded', String(opening));
    begin.textContent = opening ? 'Cancel' : 'Begin test payment';
    if (opening) {
      if (!isReduced()) gsap.from(form.children, { y: 16, autoAlpha: 0, stagger: 0.05, duration: 0.4, ease: EASE.out });
      card.input.focus();
    }
  });

  const setError = (f: { input: HTMLInputElement; error: HTMLElement }, msg: string): void => {
    f.error.textContent = msg;
    f.input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  card.input.addEventListener('input', () => {
    card.input.value = digits(card.input.value).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
  });
  exp.input.addEventListener('input', () => {
    const d = digits(exp.input.value).slice(0, 4);
    exp.input.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  });

  const prefill = (num: string): void => {
    card.input.value = num.replace(/(\d{4})(?=\d)/g, '$1 ');
    exp.input.value = '12/34';
    cvc.input.value = '123';
    [card, exp, cvc].forEach((f) => setError(f, ''));
  };
  fill.addEventListener('click', () => prefill('4242424242424242'));
  decline.addEventListener('click', () => prefill('4000000000000002'));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const num = digits(card.input.value);
    const testCard = testCards[num];

    if (!testCard) {
      // Anything that is not a published test number is wiped immediately, real or not.
      card.input.value = '';
      setError(
        card,
        luhn(num)
          ? 'That is not a test card and has been cleared. Use 4242 4242 4242 4242.'
          : 'Enter a Stripe test card, e.g. 4242 4242 4242 4242.',
      );
    } else setError(card, '');

    const [mm, yy] = exp.input.value.split('/').map(Number);
    const expValid = mm !== undefined && yy !== undefined && mm >= 1 && mm <= 12 && new Date(2000 + yy, mm, 1) > new Date();
    const cvcValid = /^\d{3,4}$/.test(cvc.input.value);
    setError(exp, expValid ? '' : 'Use a future date as MM/YY.');
    setError(cvc, cvcValid ? '' : 'CVC is 3 or 4 digits.');

    if (!testCard || !expValid || !cvcValid) {
      sound.error();
      form.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    pay.disabled = true;
    object.dataset.state = 'processing';
    objState.textContent = 'Processing';
    window.setTimeout(
      () => {
        const ok = testCard.outcome === 'succeeded';
        const last4 = num.slice(-4);
        card.input.value = '';
        cvc.input.value = '';
        pay.disabled = false;
        object.dataset.state = ok ? 'succeeded' : 'declined';
        objState.textContent = ok ? 'Succeeded' : `Declined / ${testCard.reason ?? 'declined'}`;
        receipt.replaceChildren(
          h(
            'dl',
            { class: 'receipt meta', role: 'status' },
            ...[
              ['Charge', `ch_test_${hex(14)}`],
              ['Card', `•••• ${last4}`],
              ['Status', ok ? 'Succeeded' : 'Declined'],
              ['Time', `${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`],
            ].map(([k, v]) => h('div', {}, h('dt', {}, k), h('dd', {}, v))),
          ),
        );
        if (ok) sound.success();
        else sound.error();
        if (!isReduced()) {
          gsap.fromTo(
            object.querySelector('.payobj__circle'),
            { rotation: 0 },
            { rotation: ok ? 90 : -90, duration: 0.5, ease: EASE.mechanical },
          );
        }
      },
      isReduced() ? 120 : 800,
    );
  });

  return h(
    'article',
    { class: 'exp', 'aria-labelledby': 'exp-pay' },
    h(
      'header',
      { class: 'exp__head' },
      h('p', { class: 'meta' }, 'Experiment 02 / Test mode'),
      h('h3', { id: 'exp-pay', class: 'exp__title' }, 'Payment Simulator'),
    ),
    object,
    begin,
    form,
    receipt,
  );
}

export function renderLab(): HTMLElement {
  return h(
    'section',
    { id: 'lab', class: 'section lab', 'aria-labelledby': 'lab-title', 'data-tone': 'light', 'data-from': 'dark', 'data-wipe': 'diagonal' },
    h('div', { class: 'plane', 'aria-hidden': 'true' }),
    h(
      'div',
      { class: 'container' },
      chapterLabel('lab', 'Lab', chapterCount),
      h(
        'div',
        { class: 'lab__head' },
        maskLines('h2', ['Two live', 'experiments.'], { id: 'lab-title', class: 'display lab__title' }),
        h('p', { class: 'lead' }, 'Small working pieces, built the way we build production features. Both run entirely client-side.'),
      ),
      h('div', { class: 'lab__grid' }, renderProbe(), renderPayment()),
    ),
  );
}
