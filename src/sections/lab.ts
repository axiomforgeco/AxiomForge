import { probeEndpoints, testCards, type ProbeEndpoint } from '../data/portfolioData';
import { h, sectionHead } from '../lib/dom';
import { gsap, isReduced } from '../lib/motion';
import { sound } from '../lib/sound';

const rand = (min: number, max: number): number => min + Math.random() * (max - min);
const hex = (len: number): string =>
  Array.from(crypto.getRandomValues(new Uint8Array(len)), (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, len);

/* ---------- API benchmark probe ---------- */

function renderProbe(): HTMLElement {
  const history: number[] = [];
  const recent: number[] = [];

  const picker = h(
    'fieldset',
    { class: 'probe__endpoints' },
    h('legend', { class: 'mono-label' }, 'Endpoint'),
    ...probeEndpoints.map((ep, i) =>
      h(
        'label',
        { class: 'endpoint' },
        h('input', { type: 'radio', name: 'probe-endpoint', value: ep.id, checked: i === 0 }),
        h('span', { class: `endpoint__method endpoint__method--${ep.method.toLowerCase()}` }, ep.method),
        h('span', { class: 'endpoint__path' }, ep.path),
        h('span', { class: 'endpoint__service' }, ep.service),
      ),
    ),
  );

  const send = h('button', { class: 'btn btn--blue', type: 'button' }, 'Send probe ▸');
  const status = h('span', { class: 'probe__status' }, '---');
  const latency = h('span', { class: 'probe__latency' }, '0.00');
  const bars = h('div', { class: 'probe__bars', 'aria-hidden': 'true' });
  const headersOut = h('code', {}, '// send a probe to inspect response headers');
  const bodyOut = h('code', {}, '// response body appears here');
  const summary = h('p', { class: 'visually-hidden', 'aria-live': 'polite' });

  const selected = (): ProbeEndpoint =>
    probeEndpoints.find(
      (ep) =>
        ep.id ===
        picker.querySelector<HTMLInputElement>('input[name="probe-endpoint"]:checked')?.value,
    ) ?? probeEndpoints[0]!;

  const drawBars = (): void => {
    const max = Math.max(...history, 1);
    bars.replaceChildren(
      ...history.map((ms) => {
        const bar = h('span', { class: 'probe__bar' });
        bar.style.setProperty('--h', `${Math.max(6, (ms / max) * 100)}%`);
        return bar;
      }),
    );
  };

  send.addEventListener('click', () => {
    const ep = selected();
    const now = performance.now();
    while (recent.length && now - recent[0]! > 4000) recent.shift();
    recent.push(now);
    // Demonstrates the rate limiter: more than 5 probes in 4 seconds gets a 429.
    const limited = recent.length > 5;

    const ms = limited ? rand(0.2, 0.6) : rand(...ep.latencyMs);
    const code = limited ? 429 : 200;
    const headers: Record<string, string> = {
      'content-type': 'application/json; charset=utf-8',
      'x-request-id': `req_${hex(12)}`,
      'cache-control': 'no-store',
      'strict-transport-security': 'max-age=63072000; includeSubDomains',
      'x-content-type-options': 'nosniff',
      'server-timing': `app;dur=${ms.toFixed(2)}`,
      ...(limited ? { 'retry-after': '4', 'ratelimit-remaining': '0' } : { 'ratelimit-remaining': String(5 - recent.length) }),
    };
    const body = limited
      ? { error: { code: 'RATE_LIMITED', message: 'Too many probes. Retry in 4s.' } }
      : ep.body;

    status.textContent = `${code} ${limited ? 'TOO MANY REQUESTS' : 'OK'}`;
    status.dataset.code = String(code);
    headersOut.textContent = JSON.stringify(headers, null, 2);
    bodyOut.textContent = JSON.stringify(body, null, 2);
    summary.textContent = `${ep.method} ${ep.path} returned ${code} in ${ms.toFixed(2)} milliseconds.`;
    if (limited) sound.error();

    history.push(ms);
    if (history.length > 16) history.shift();
    drawBars();

    if (isReduced()) {
      latency.textContent = ms.toFixed(2);
    } else {
      const counter = { v: 0 };
      gsap.to(counter, {
        v: ms,
        duration: 0.45,
        ease: 'steps(9)',
        onUpdate: () => {
          latency.textContent = counter.v.toFixed(2);
        },
      });
    }
  });

  return h(
    'article',
    { class: 'lab-card', 'aria-labelledby': 'probe-title' },
    h(
      'header',
      { class: 'lab-card__head fill-blue' },
      h('p', { class: 'mono-label' }, 'Widget A — Simulated'),
      h('h3', { id: 'probe-title', class: 'lab-card__title' }, 'API Benchmark Probe'),
    ),
    h(
      'div',
      { class: 'lab-card__body' },
      picker,
      send,
      h(
        'div',
        { class: 'probe__readout' },
        h('div', {}, h('p', { class: 'mono-label' }, 'Status'), status),
        h(
          'div',
          {},
          h('p', { class: 'mono-label' }, 'Latency'),
          h('p', { class: 'probe__latency-wrap' }, latency, h('span', { class: 'probe__unit' }, 'ms')),
        ),
        bars,
      ),
      h('p', { class: 'mono-label' }, 'Response headers'),
      h('pre', { class: 'code code--small', tabindex: '0' }, headersOut),
      h('p', { class: 'mono-label' }, 'Response body'),
      h('pre', { class: 'code code--small', tabindex: '0' }, bodyOut),
      summary,
      h(
        'p',
        { class: 'lab-card__note' },
        'Runs entirely in your browser against a mock of our services. Fire more than 5 probes in 4 seconds to meet the rate limiter.',
      ),
    ),
  );
}

/* ---------- Test payment simulator ---------- */

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

function field(
  id: string,
  label: string,
  attrs: Record<string, string | boolean>,
): { wrap: HTMLElement; input: HTMLInputElement; error: HTMLElement } {
  const error = h('p', { class: 'field__error', id: `${id}-error` });
  const input = h('input', {
    id,
    class: 'field__input',
    'aria-describedby': `${id}-error`,
    autocomplete: 'off',
    ...attrs,
  });
  return { wrap: h('div', { class: 'field' }, h('label', { for: id, class: 'field__label' }, label), input, error), input, error };
}

function renderPayment(): HTMLElement {
  const AMOUNT = '$49.00';
  // Deliberately not cc-* names or autocomplete tokens, so browsers never offer saved real cards.
  const card = field('sim-card', 'Test card number', {
    inputmode: 'numeric',
    placeholder: '4242 4242 4242 4242',
    maxlength: '23',
    spellcheck: false,
  });
  const exp = field('sim-exp', 'Expiry (MM/YY)', { inputmode: 'numeric', placeholder: '12/34', maxlength: '5' });
  const cvc = field('sim-cvc', 'CVC', { inputmode: 'numeric', placeholder: '123', maxlength: '4' });

  const fillBtn = h('button', { class: 'btn btn--small', type: 'button' }, 'Use test card 4242');
  const declineBtn = h('button', { class: 'btn btn--small', type: 'button' }, 'Use decline card');
  const pay = h('button', { class: 'btn btn--yellow', type: 'submit' }, `Pay ${AMOUNT} (test)`);
  const receiptSlot = h('div', { class: 'receipt-slot', 'aria-live': 'polite' });

  const form = h(
    'form',
    { class: 'payment', novalidate: true },
    h(
      'p',
      { class: 'payment__warning' },
      h('strong', {}, 'Test mode only. '),
      'Nothing is charged and nothing leaves this page. Only Stripe test numbers are accepted. Never enter a real card.',
    ),
    h('div', { class: 'payment__quick' }, fillBtn, declineBtn),
    card.wrap,
    h('div', { class: 'payment__row' }, exp.wrap, cvc.wrap),
    pay,
  );

  const setError = (f: { input: HTMLInputElement; error: HTMLElement }, msg: string): void => {
    f.error.textContent = msg;
    f.input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  card.input.addEventListener('input', () => {
    const d = digits(card.input.value).slice(0, 19);
    card.input.value = d.replace(/(\d{4})(?=\d)/g, '$1 ');
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
  fillBtn.addEventListener('click', () => prefill('4242424242424242'));
  declineBtn.addEventListener('click', () => prefill('4000000000000002'));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const num = digits(card.input.value);
    const testCard = testCards[num];
    let ok = true;

    if (!testCard) {
      ok = false;
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
    const now = new Date();
    const expValid =
      mm !== undefined &&
      yy !== undefined &&
      mm >= 1 &&
      mm <= 12 &&
      new Date(2000 + yy, mm, 1) > now;
    setError(exp, expValid ? '' : 'Use a future date as MM/YY.');
    setError(cvc, /^\d{3,4}$/.test(cvc.input.value) ? '' : 'CVC is 3 or 4 digits.');
    ok = ok && expValid && /^\d{3,4}$/.test(cvc.input.value);

    if (!ok || !testCard) {
      sound.error();
      form.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    pay.disabled = true;
    pay.textContent = 'Processing…';
    window.setTimeout(
      () => {
        const last4 = num.slice(-4);
        card.input.value = '';
        cvc.input.value = '';
        pay.disabled = false;
        pay.textContent = `Pay ${AMOUNT} (test)`;
        const receipt = renderReceipt(testCard.outcome, AMOUNT, last4, testCard.reason);
        receiptSlot.replaceChildren(receipt);
        if (testCard.outcome === 'succeeded') sound.success();
        else sound.error();
        if (!isReduced()) {
          gsap.from(receipt, { yPercent: -30, autoAlpha: 0, duration: 0.5, ease: 'steps(5)' });
        }
      },
      isReduced() ? 150 : 900,
    );
  });

  return h(
    'article',
    { class: 'lab-card', 'aria-labelledby': 'pay-title' },
    h(
      'header',
      { class: 'lab-card__head fill-yellow' },
      h('p', { class: 'mono-label' }, 'Widget B — Test mode'),
      h('h3', { id: 'pay-title', class: 'lab-card__title' }, 'Test Payment Simulator'),
    ),
    h('div', { class: 'lab-card__body' }, form, receiptSlot),
  );
}

function renderReceipt(
  outcome: 'succeeded' | 'declined',
  amount: string,
  last4: string,
  reason?: string,
): HTMLElement {
  const ok = outcome === 'succeeded';
  const rows: [string, string][] = [
    ['Charge', `ch_test_${hex(14)}`],
    ['Amount', amount],
    ['Card', `•••• ${last4}`],
    ['Status', ok ? 'SUCCEEDED' : `DECLINED (${reason ?? 'declined'})`],
    ['Time', `${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`],
  ];
  const barcode = Array.from(crypto.getRandomValues(new Uint8Array(28)), (b) => {
    const line = h('span');
    line.style.setProperty('--w', String((b % 4) + 1));
    return line;
  });
  return h(
    'div',
    { class: `receipt ${ok ? 'receipt--ok' : 'receipt--fail'}`, role: 'status' },
    h('p', { class: 'receipt__title' }, ok ? 'Receipt — test mode' : 'Payment declined — test mode'),
    h('dl', { class: 'receipt__rows' }, ...rows.map(([k, v]) => h('div', {}, h('dt', {}, k), h('dd', {}, v)))),
    h('div', { class: 'receipt__barcode', 'aria-hidden': 'true' }, ...barcode),
  );
}

export function renderLab(): HTMLElement {
  return h(
    'section',
    { id: 'lab', class: 'section lab', 'aria-labelledby': 'lab-title' },
    h(
      'div',
      { class: 'container' },
      sectionHead(
        '05',
        'Lab',
        'Interactive Lab',
        'Two live widgets built the way we build production features. Both run entirely client-side.',
      ),
      h('div', { class: 'lab__grid' }, renderProbe(), renderPayment()),
    ),
  );
}
