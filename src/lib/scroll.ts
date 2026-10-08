import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger } from './motion';

/**
 * One clock for everything:
 *
 *   input → Lenis → gsap.ticker → ScrollTrigger → scenes → geometry / type
 *
 * Lenis smooths wheel and trackpad input on desktop only. It never runs its own
 * requestAnimationFrame: GSAP's ticker drives it, and every Lenis scroll updates
 * ScrollTrigger in the same frame. Touch devices and reduced motion keep native scrolling.
 */
let lenis: Lenis | null = null;

const SMOOTH = '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)';

export function initSmoothScroll(): void {
  gsap.matchMedia().add(SMOOTH, () => {
    lenis = new Lenis({
      autoRaf: false,
      // Responsive, not floaty: input is followed closely and settles quickly.
      lerp: 0.14,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
    });
    lenis.on('scroll', ScrollTrigger.update);
    // Pins add spacing after Lenis starts: re-measure its scroll limit on every refresh,
    // otherwise deep targets would be clamped to the old page height.
    const remeasure = (): void => lenis?.resize();
    ScrollTrigger.addEventListener('refresh', remeasure);
    const tick = (time: number): void => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    // A long frame must not make scrubbed animations leap to catch up.
    gsap.ticker.lagSmoothing(0);
    return () => {
      ScrollTrigger.removeEventListener('refresh', remeasure);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis?.destroy();
      lenis = null;
    };
  });
}

/** Scroll the page to a y position through whichever engine is active. */
export function scrollToY(y: number, { immediate = false } = {}): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (lenis) {
    lenis.resize();
    lenis.scrollTo(y, immediate ? { immediate: true } : { duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    window.scrollTo({ top: y, behavior: immediate || reduced ? 'auto' : 'smooth' });
  }
}

/** Pause page scrolling while a full-screen environment (case study) is open. */
export function lockScroll(locked: boolean): void {
  if (locked) lenis?.stop();
  else lenis?.start();
}

const MEMORY = 'axiomforge:scroll';
const here = (): string => window.location.pathname + window.location.search + window.location.hash;

/**
 * Deep links and mid-page refreshes. The page builds its pins in JavaScript, so the
 * browser's own restoration would land before pin spacing exists. Restore once
 * ScrollTrigger has measured the final layout instead.
 *
 * A refresh returns to exactly where the visitor was, even if a nav click left a
 * #hash in the URL; a #hash is only followed when it is a fresh deep link.
 */
export function restorePosition(resolveHash: (id: string) => number | null): void {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('pagehide', () => {
    try {
      sessionStorage.setItem(MEMORY, JSON.stringify({ y: window.scrollY, url: here() }));
    } catch {
      /* storage unavailable */
    }
  });

  let saved: { y: number; url: string } | null = null;
  try {
    saved = JSON.parse(sessionStorage.getItem(MEMORY) ?? 'null') as { y: number; url: string } | null;
  } catch {
    saved = null;
  }

  const hash = decodeURIComponent(window.location.hash.slice(1));
  const resolve = (): number | null => (saved && saved.url === here() ? saved.y : hash ? resolveHash(hash) : null);

  // Start-up re-measures (fonts arriving, window load, the browser's own fragment jump)
  // can move the page after the first restore. Re-apply the target after each refresh,
  // until the visitor takes over or start-up is clearly over.
  let settled = false;
  const release = (): void => {
    settled = true;
    ScrollTrigger.removeEventListener('refresh', apply);
  };
  function apply(): void {
    const y = resolve();
    if (!settled && y !== null && y > 0) scrollToY(y, { immediate: true });
  }
  for (const type of ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const) {
    window.addEventListener(type, release, { once: true, passive: true });
  }
  ScrollTrigger.addEventListener('refresh', apply);
  window.setTimeout(release, 3000);
  apply();
}
