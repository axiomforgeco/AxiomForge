// Visual QA: drives the installed Microsoft Edge (no browser download) through every chapter
// at several viewports, with real requestAnimationFrame timing.
//   npm run dev            (in one terminal)
//   npm run check:visual   → screenshots + report in ./visual-check/
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const BASE = process.env.URL ?? 'http://localhost:5173/';
const OUT = 'visual-check';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge' });
const report = {};

const wait = (page, ms) => page.waitForTimeout(ms);

/** Scroll positions for every chapter; pinned chapters get several stops. */
async function stops(page) {
  return page.evaluate(() => {
    const box = (sel) => {
      const el = document.querySelector(sel);
      const spacer = el.parentElement.classList.contains('pin-spacer') ? el.parentElement : null;
      const top = (spacer ?? el).getBoundingClientRect().top + scrollY;
      const travel = spacer ? spacer.offsetHeight - innerHeight : 0;
      return { top, travel, pinned: !!spacer, height: (spacer ?? el).offsetHeight };
    };
    const out = [];
    const add = (name, y) => out.push({ name, y: Math.max(0, Math.round(y)) });
    const people = box('#people');
    add('relay-hero-people', people.top - innerHeight * 0.45);
    add('philosophy', box('#philosophy').top + innerHeight * 0.35);
    (people.pinned ? [0.02, 0.25, 0.5, 0.98] : [0, 1, 2]).forEach((f, i) =>
      add(`people-${i}`, people.pinned ? people.top + people.travel * f : people.top + innerHeight * f * 0.9),
    );
    const intro = box('.work__intro');
    add('work-intro', intro.top);
    const work = box('.work__gallery');
    add('relay-people-work', work.top - innerHeight * 0.4);
    (work.pinned ? [0.03, 0.12, 0.155, 0.19, 0.3, 0.55, 0.97] : [0, 1, 2, 3]).forEach((f, i) =>
      add(`work-${i}`, work.pinned ? work.top + work.travel * f : work.top + innerHeight * (0.1 + f * 0.95)),
    );
    const system = box('#system');
    add('relay-work-system', system.top - innerHeight * 0.4);
    (system.pinned ? [0.05, 0.5, 0.97] : [0, 1]).forEach((f, i) =>
      add(`system-${i}`, system.pinned ? system.top + system.travel * f : system.top + innerHeight * f),
    );
    const sec = box('.security__stage');
    add('security', box('#security').top + innerHeight * 0.1);
    add('security-stage', sec.top - innerHeight * 0.3);
    add('lab', box('#lab').top + innerHeight * 0.45);
    add('contact', box('#contact').top);
    add('contact-form', box('.contact__grid').top - innerHeight * 0.2);
    add('footer', document.documentElement.scrollHeight);
    return out;
  });
}

/** Average frame interval while scrolling continuously through the page's heaviest scenes. */
async function frameRate(page) {
  return page.evaluate(async () => {
    const work = document.querySelector('.work__gallery');
    const start = (work.parentElement.classList.contains('pin-spacer') ? work.parentElement : work).getBoundingClientRect().top + scrollY - innerHeight;
    window.scrollTo(0, start);
    await new Promise((r) => setTimeout(r, 300));
    const deltas = [];
    let last = performance.now();
    await new Promise((resolve) => {
      let frames = 0;
      const step = (now) => {
        deltas.push(now - last);
        last = now;
        window.scrollBy(0, 24);
        if (++frames < 180) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    deltas.shift();
    const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    return { avgMs: +avg.toFixed(2), fps: +(1000 / avg).toFixed(1), over33ms: deltas.filter((d) => d > 33).length };
  });
}

async function run(name, { width, height, reducedMotion = 'no-preference', mobile = false, interactions = false }) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    reducedMotion,
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await wait(page, 600);
  await page.screenshot({ path: `${OUT}/${name}-00-intro.png` });
  await wait(page, 2200);
  await page.screenshot({ path: `${OUT}/${name}-01-hero.png` });

  const info = await page.evaluate(() => ({
    mode: document.documentElement.dataset.motion,
    pins: document.querySelectorAll('.pin-spacer').length,
    overflowX: document.documentElement.scrollWidth - innerWidth,
  }));

  let n = 2;
  for (const s of await stops(page)) {
    await page.evaluate((y) => window.scrollTo(0, y), s.y);
    await wait(page, 1300);
    await page.screenshot({ path: `${OUT}/${name}-${String(n++).padStart(2, '0')}-${s.name}.png` });
  }

  const result = { ...info, errors };
  if (reducedMotion === 'no-preference') result.frames = await frameRate(page);

  if (interactions) {
    // Security simulation, mid-run.
    await page.evaluate(() => document.getElementById('security').scrollIntoView());
    await wait(page, 800);
    await page.click('#security .btn');
    await wait(page, 1500);
    await page.screenshot({ path: `${OUT}/${name}-90-security-run.png` });
    await wait(page, 2000);
    result.securityStates = await page.$$eval('.state.is-on', (els) => els.length);

    // Probe and payment.
    await page.evaluate(() => document.getElementById('lab').scrollIntoView());
    await page.click('.exp .btn');
    await page.click('[aria-controls="payment-form"]');
    await page.click('.payment__quick .link-btn');
    await page.click('.payment .btn--ink');
    await wait(page, 1200);
    await page.evaluate(() => document.querySelector('.lab__grid').scrollIntoView());
    await wait(page, 300);
    await page.screenshot({ path: `${OUT}/${name}-91-lab.png` });
    result.payment = await page.$eval('.payobj', (el) => el.dataset.state);

    // Case study (project mode).
    // Open from the poster on stage, as a visitor would.
    await page.evaluate(() => {
      const g = document.querySelector('.work__gallery');
      const box = g.parentElement.classList.contains('pin-spacer') ? g.parentElement : g;
      // Into the first project's hold, after its entrance has revealed the metadata.
      window.scrollTo(0, box.getBoundingClientRect().top + scrollY + (box.offsetHeight - innerHeight) * 0.12);
    });
    await wait(page, 1500);
    await page.mouse.move(400, 400);
    await page.click('[data-open="mughlai"]');
    await wait(page, 200);
    await page.screenshot({ path: `${OUT}/${name}-92a-case-expand.png` });
    await wait(page, 350);
    await page.screenshot({ path: `${OUT}/${name}-92b-case-transform.png` });
    await wait(page, 1600);
    await page.mouse.move(700, 450, { steps: 4 });
    await page.screenshot({ path: `${OUT}/${name}-93-case.png` });
    // The custom cursor must never be left behind the top-layer dialog.
    const cursorState = () =>
      page.evaluate(() => {
        const c = document.querySelector('.cursor');
        if (!c) return 'native';
        const modal = [...document.querySelectorAll('dialog[open]')].find((d) => d.matches(':modal'));
        return (modal ? modal.contains(c) : c.parentElement === document.body) && c.classList.contains('is-visible') ? 'visible' : 'HIDDEN';
      });
    result.cursorInCase = await cursorState();
    await page.keyboard.press('Escape');
    await wait(page, 1800);
    await page.mouse.move(600, 400, { steps: 4 });
    result.caseClosedWithEscape = await page.$eval('.case', (d) => !d.open);
    result.cursorAfterCase = await cursorState();

    // Contact validation.
    await page.evaluate(() => document.querySelector('.contact__form').requestSubmit());
    result.contactErrors = await page.$$eval('.contact__form .field__error', (els) => els.filter((e) => e.textContent).length);

    // Keyboard: first 30 tab stops, each must show a focus indicator.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.focus('body');
    const stopsSeen = [];
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      stopsSeen.push(
        await page.evaluate(() => {
          const el = document.activeElement;
          const cs = getComputedStyle(el);
          const label = (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 32);
          const visible = cs.outlineStyle !== 'none' || el.closest('label') !== null;
          return `${el.tagName.toLowerCase()} "${label}"${visible ? '' : ' [NO FOCUS RING]'}`;
        }),
      );
    }
    result.tabOrder = stopsSeen;
  }

  // The Projects archive: every entry, its links, and the case viewer.
  await page.goto(`${BASE}projects.html`, { waitUntil: 'networkidle' });
  await wait(page, 1800);
  const archive = await page.evaluate(() => {
    const projects = [...document.querySelectorAll('article[id^="p-"]')];
    const labels = (e) => [...e.querySelectorAll('.entry__label')].map((l) => l.textContent);
    return {
      projects: projects.length,
      groups: [...document.querySelectorAll('.archive__group')].map((g) => g.id),
      count: document.querySelector('.archive__count')?.textContent,
      overflowX: document.documentElement.scrollWidth - innerWidth,
      nav: [...document.querySelectorAll('.site-nav a')].map((a) => a.textContent),
      // Every project carries what it was / is, the problem, and how it is used.
      incomplete: projects
        .filter((e) => {
          const l = labels(e);
          return !(l.some((x) => /^What it (was|is)$/.test(x)) && l.includes('The problem') && l.includes('How it is used'));
        })
        .map((e) => e.id),
    };
  });
  let k = 0;
  await page.screenshot({ path: `${OUT}/${name}-a${k++}-archive.png` });
  for (const id of archive.groups) {
    await page.evaluate((sel) => document.getElementById(sel).scrollIntoView(), id);
    await wait(page, 1300);
    await page.screenshot({ path: `${OUT}/${name}-a${k++}-${id}.png` });
  }
  if (interactions) {
    await page.evaluate(() => document.getElementById('p-fleet').scrollIntoView());
    await wait(page, 1200);
    await page.mouse.move(400, 400);
    await page.click('#p-fleet [data-open]');
    await wait(page, 2000);
    await page.mouse.move(700, 450, { steps: 4 });
    await page.screenshot({ path: `${OUT}/${name}-a9-case.png` });
    archive.caseTitle = await page.$eval('#case-title', (e) => e.textContent);
    archive.cursorInCase = await page.evaluate(() => {
      const c = document.querySelector('.cursor');
      const d = document.querySelector('dialog.case');
      return c && d.contains(c) && c.classList.contains('is-visible') ? 'visible' : 'HIDDEN';
    });
    await page.keyboard.press('Escape');
    await wait(page, 1600);
    archive.caseClosed = await page.$eval('.case', (d) => !d.open);
  }
  result.archive = archive;

  report[name] = result;
  await ctx.close();
}

/** Frame sequence through the first poster change, with snapping disabled (dev `?qa`). */
async function film(name, { width, height }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}?qa`, { waitUntil: 'networkidle' });
  await wait(page, 2500);
  const range = await page.evaluate(() => {
    const g = document.querySelector('.work__gallery').parentElement;
    const top = g.getBoundingClientRect().top + scrollY;
    return { top, travel: g.offsetHeight - innerHeight };
  });
  // The whole gallery: three entrances, two changes, the pass-through.
  for (let k = 0; k <= 35; k++) {
    const f = k / 35;
    await page.evaluate((y) => window.scrollTo(0, y), range.top + range.travel * f);
    await wait(page, 700);
    await page.screenshot({ path: `${OUT}/${name}-film-${String(k).padStart(2, '0')}.png` });
  }
  await ctx.close();
}

await film('1440', { width: 1440, height: 900 });
if (process.env.FILM_ONLY) {
  await browser.close();
  process.exit(0);
}
await run('1440', { width: 1440, height: 900, interactions: true });
await run('1920', { width: 1920, height: 1080 });
await run('1366', { width: 1366, height: 768 });
await run('320', { width: 320, height: 568, mobile: true });
await run('360', { width: 360, height: 800, mobile: true });
await run('375', { width: 375, height: 812, mobile: true });
await run('390', { width: 390, height: 844, mobile: true });
await run('414', { width: 414, height: 896, mobile: true });
await run('430', { width: 430, height: 932, mobile: true });
await run('768', { width: 768, height: 1024, mobile: true });
await run('1024', { width: 1024, height: 768, mobile: true });
await run('1440-reduced', { width: 1440, height: 900, reducedMotion: 'reduce' });

await browser.close();
await writeFile(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
