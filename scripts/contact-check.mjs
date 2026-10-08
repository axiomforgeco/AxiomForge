// Contact-form QA: validation, sending state, duplicate protection, confirmed-only success,
// provider/network failures, cooldown and honeypot. EmailJS is intercepted; nothing is sent.
//   VITE_EMAILJS_SERVICE_ID=svc VITE_EMAILJS_TEMPLATE_ID=tpl VITE_EMAILJS_PUBLIC_KEY=pk npx vite build --outDir /tmp/dist-mail
//   npx vite preview --outDir /tmp/dist-mail --port 4199
//   npm run check:contact
import { chromium } from 'playwright-core';
const BASE = process.env.BASE ?? 'http://localhost:4199/';
const b = await chromium.launch({ channel: 'chrome' });
const out = {};

async function page(mode) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  const requests = [];
  await p.route('https://api.emailjs.com/**', async (route) => {
    const body = route.request().postDataJSON();
    requests.push(body);
    if (mode === 'ok') return route.fulfill({ status: 200, body: 'OK' });
    if (mode === 'provider') return route.fulfill({ status: 400, body: 'The template ID is invalid' });
    if (mode === 'network') return route.abort('internetdisconnected');
    if (mode === 'slow') {
      await new Promise((r) => setTimeout(r, 2500));
      return route.fulfill({ status: 200, body: 'OK' });
    }
  });
  await p.goto(BASE);
  await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelector('.contact__form').scrollIntoView());
  await p.waitForTimeout(800);
  return { ctx, p, errors, requests };
}
const fill = async (p, v = {}) => {
  await p.fill('#contact-name', v.name ?? 'Test Person');
  await p.fill('#contact-email', v.email ?? 'test@example.com');
  await p.fill('#contact-subject', v.subject ?? 'Website enquiry');
  await p.fill('#contact-message', v.message ?? 'Hello <b>there</b>, we would like to talk about a project.');
};
const state = (p) =>
  p.evaluate(() => ({
    button: document.querySelector('.contact__form button[type=submit]').textContent,
    disabled: document.querySelector('.contact__form button[type=submit]').disabled,
    busy: document.querySelector('.contact__form').getAttribute('aria-busy'),
    result: document.querySelector('.contact__result').textContent.trim().slice(0, 80),
    errors: [...document.querySelectorAll('.field__error')].map((e) => e.textContent).filter(Boolean),
    values: ['name', 'email', 'subject', 'message'].map((n) => document.getElementById(`contact-${n}`).value.length),
  }));

// 1. Validation: empty and invalid fields never send.
{
  const { ctx, p, requests } = await page('ok');
  await p.click('.contact__form button[type=submit]');
  await p.waitForTimeout(300);
  out.empty = { ...(await state(p)), requests: requests.length };
  await fill(p, { email: 'not-an-email' });
  await p.click('.contact__form button[type=submit]');
  await p.waitForTimeout(300);
  out.invalidEmail = { ...(await state(p)), requests: requests.length };
  // Excessively long message: maxlength truncates what the field accepts.
  await fill(p, { message: 'x'.repeat(6000) });
  out.longMessageLength = await p.$eval('#contact-message', (e) => e.value.length);
  await ctx.close();
}
// 2. Success only after the provider confirms; payload checked; form cleared; duplicates blocked.
{
  const { ctx, p, requests, errors } = await page('slow');
  await fill(p);
  await p.click('.contact__form button[type=submit]');
  await p.waitForTimeout(400);
  out.submitting = await state(p);
  // Hammer the button while it is sending.
  await p.evaluate(() => {
    const f = document.querySelector('.contact__form');
    for (let i = 0; i < 5; i++) f.requestSubmit();
  });
  await p.waitForTimeout(3200);
  out.success = { ...(await state(p)), requests: requests.length, errors };
  const r = requests[0] ?? {};
  out.payload = { keys: Object.keys(r), params: r.template_params, hasRecipientParam: JSON.stringify(r).includes('to_email') };
  // Cooldown: a second message straight away is refused, not sent.
  await fill(p);
  await p.click('.contact__form button[type=submit]');
  await p.waitForTimeout(500);
  out.cooldown = { ...(await state(p)), requests: requests.length };
  await ctx.close();
}
// 3. Provider failure and network failure show the error state, never success.
for (const mode of ['provider', 'network']) {
  const { ctx, p, requests } = await page(mode);
  await fill(p);
  await p.click('.contact__form button[type=submit]');
  await p.waitForTimeout(1500);
  out[mode] = { ...(await state(p)), requests: requests.length };
  await ctx.close();
}
// 4. Honeypot: a filled trap sends nothing.
{
  const { ctx, p, requests } = await page('ok');
  await fill(p);
  await p.evaluate(() => (document.querySelector('input[name=company]').value = 'spam'));
  await p.click('.contact__form button[type=submit]');
  await p.waitForTimeout(800);
  out.honeypot = { ...(await state(p)), requests: requests.length };
  await ctx.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();
