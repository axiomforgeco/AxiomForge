// Scroll QA: real wheel input through Lenis, frame-by-frame.
//   npm run dev
//   npm run check:scroll        (Edge and Chrome, several desktop sizes)
// Reports per-frame jumps, pinned-section drift, frame pacing, nav/deep-link/refresh/resize behaviour.
import { chromium } from 'playwright-core';

const BASE = process.env.URL ?? 'http://localhost:5173/';
const QA = `${BASE}?qa`;
const results = {};

/** Installs a per-frame recorder: scroll position, frame interval, and drift of active pins. */
const RECORDER = () => {
  window.__frames = [];
  const pins = () =>
    window.__ST.getAll().filter((st) => st.pin && st.isActive).map((st) => Math.abs(st.pin.getBoundingClientRect().top));
  let last = performance.now();
  const loop = (now) => {
    window.__frames.push({ dt: now - last, y: window.scrollY, drift: Math.max(0, ...pins()) });
    last = now;
    window.__rec = requestAnimationFrame(loop);
  };
  window.__rec = requestAnimationFrame(loop);
};

const summarise = (frames, vh) => {
  const deltas = frames.slice(1).map((f, i) => Math.abs(f.y - frames[i].y));
  const dts = frames.slice(1).map((f) => f.dt);
  return {
    frames: frames.length,
    maxStepPx: Math.round(Math.max(0, ...deltas)),
    jumps: deltas.filter((d) => d > vh * 0.5).length,
    maxPinDriftPx: +Math.max(0, ...frames.map((f) => f.drift)).toFixed(2),
    longFrames: dts.filter((d) => d > 33).length,
    avgFrameMs: +(dts.reduce((a, b) => a + b, 0) / Math.max(1, dts.length)).toFixed(2),
  };
};

async function wheel(page, { delta, count, gap }) {
  for (let i = 0; i < count; i++) {
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(gap);
  }
}

async function check(channel, width, height) {
  const browser = await chromium.launch({ channel });
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(QA, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  await page.mouse.move(width / 2, height / 2);
  const r = { lenis: await page.evaluate(() => document.documentElement.classList.contains('lenis')) };

  await page.evaluate(RECORDER);
  // Slow, medium, very fast, then reverse.
  await wheel(page, { delta: 60, count: 30, gap: 60 });
  await wheel(page, { delta: 160, count: 40, gap: 40 });
  await wheel(page, { delta: 600, count: 40, gap: 16 });
  await wheel(page, { delta: -400, count: 30, gap: 20 });
  await wheel(page, { delta: 400, count: 60, gap: 20 });
  await page.waitForTimeout(1200);
  const frames = await page.evaluate(() => {
    cancelAnimationFrame(window.__rec);
    return window.__frames;
  });
  r.wheel = summarise(frames, height);

  // Navigation clicks land on the chapter (pin-aware) and the active indicator follows.
  r.nav = {};
  for (const id of ['work', 'people', 'system', 'contact']) {
    await page.click(`[data-nav="${id}"]`);
    await page.waitForTimeout(1800);
    r.nav[id] = await page.evaluate((id) => {
      const el = document.getElementById(id);
      const box = el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el;
      return {
        offsetPx: Math.round(box.getBoundingClientRect().top),
        active: document.querySelector('[aria-current="true"]')?.dataset.nav ?? null,
      };
    }, id);
  }

  // Projects is its own page; the header's links lead back into the homepage chapters.
  await page.click('[data-nav="projects"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  r.projectsPage = { url: new URL(page.url()).pathname, entries: await page.$$eval('.entry', (e) => e.length) };
  await page.click('[data-nav="system"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);
  r.projectsPage.backTo = await page.evaluate(() => ({
    hash: location.hash,
    offsetPx: Math.round(document.getElementById('system').parentElement.getBoundingClientRect().top),
  }));
  await page.goBack();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
  r.projectsPage.back = new URL(page.url()).pathname;
  await page.goBack();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  r.projectsPage.backAgain = new URL(page.url()).pathname + new URL(page.url()).hash;
  await page.goto(QA, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Refresh mid-page restores the position.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await wheel(page, { delta: 120, count: 60, gap: 25 });
  await page.waitForTimeout(1200);
  const before = await page.evaluate(() => Math.round(window.scrollY));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  r.refresh = { before, after: await page.evaluate(() => Math.round(window.scrollY)) };

  // Deep link to a chapter behind two pins.
  await page.goto(`${QA}#system`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  r.deepLink = await page.evaluate(() => {
    const el = document.getElementById('system');
    const box = el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el;
    return { offsetPx: Math.round(box.getBoundingClientRect().top) };
  });

  // Resize mid-page: pins re-measure, no overflow, then a wheel pass stays stable.
  await page.setViewportSize({ width: Math.round(width * 0.8), height: Math.round(height * 0.85) });
  await page.waitForTimeout(800);
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.evaluate(RECORDER);
  await wheel(page, { delta: 300, count: 60, gap: 20 });
  await page.waitForTimeout(800);
  r.afterResize = summarise(
    await page.evaluate(() => {
      cancelAnimationFrame(window.__rec);
      return window.__frames;
    }),
    height,
  );
  r.overflowX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  r.errors = errors;
  results[`${channel} ${width}x${height}`] = r;
  await browser.close();
}

for (const channel of ['msedge', 'chrome']) {
  await check(channel, 1440, 900);
  await check(channel, 1366, 768);
}
await check('chrome', 1920, 1080);
console.log(JSON.stringify(results, null, 2));
