import { $, $$ } from '../lib/dom';
import { createScene, DUR, EASE, gsap } from '../lib/motion';

/**
 * The hypermotion intro: the system forges itself, then becomes the hero.
 *
 *   01 FRONTEND  the grid snaps in, an interface frame draws itself
 *   02 SOFTWARE  structured nodes lock in and connect
 *   03 CLOUD     an orbit closes around the structure; infrastructure nodes appear
 *   04 SECURITY  a red threat enters, a boundary forms, the threat is turned away
 *   FORGE        everything compresses to a point; AXIOMFORGE assembles from it
 *   REVEAL       the wordmark travels into the header; the hero pieces expand out of
 *                the forged centre into their composition; the headline rises
 *
 * About 1.25s of forging, then the reveal. Never blocks: the page scrolls from the first frame, and any
 * input fast-forwards the sequence. No "loading", no "click to enter".
 */
export function animateHero(root: HTMLElement): void {
  const header = $('.site-header');
  const circle = $('.hero__geo--circle svg', root);
  const triangle = $('.hero__geo--triangle svg', root);
  const square = $('.hero__geo--square .cube', root);
  const spin = $('.hero__geo--square .cube__spin', root);
  const bar = $('.hero__bar .hero__geo-v', root);
  const status = $('.hero__system span:last-child', root);
  const forgeEl = $('.forge', root);
  const forgeSvg = $('.forge__svg', root);
  const mark = $('.forge__mark', root);
  const READY = status.textContent ?? '';

  const intro = (): gsap.core.Timeline => {
    const f = forgeSvg.getBoundingClientRect();
    const core = { x: f.left + f.width / 2, y: f.top + f.height / 2 };
    const fromCore = (el: Element): { x: number; y: number } => {
      const r = el.getBoundingClientRect();
      return { x: core.x - (r.left + r.width / 2), y: core.y - (r.top + r.height / 2) };
    };
    const c = fromCore(circle);
    const t = fromCore(triangle);
    const sq = fromCore(square);
    const nameEl = $('.wordmark__name');

    gsap.set(forgeEl, { autoAlpha: 1 });
    const tl = gsap
      .timeline({ defaults: { ease: EASE.mechanical }, paused: true, onComplete: () => gsap.set(forgeEl, { display: 'none' }) })
      .call(() => (status.textContent = 'AxiomForge / Initializing'), [], 0)
      .from('.hero__system', { clipPath: 'inset(0 100% 0 0)', duration: 0.25, ease: 'steps(8)' }, 0)
      // 01 FRONTEND
      .fromTo('.hero__grid-lines span', { scaleY: 0, transformOrigin: 'top' }, { scaleY: 1, duration: 0.4, stagger: 0.015, ease: EASE.inOut }, 0.02)
      .fromTo('.forge__frame', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, ease: EASE.inOut, stagger: 0.08 }, 0.05)
      // 02 SOFTWARE
      .fromTo('.forge__node', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.18, ease: 'steps(2)', stagger: 0.035 }, 0.28)
      .fromTo('.forge__wire', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.25, ease: EASE.inOut }, 0.36)
      // 03 CLOUD
      .fromTo('.forge__orbit', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, ease: EASE.inOut }, 0.5)
      .fromTo('.forge__dot', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.15, ease: 'steps(2)', stagger: 0.04 }, 0.62)
      // 04 SECURITY
      .fromTo('.forge__threat', { x: -40, autoAlpha: 0 }, { x: 22, autoAlpha: 1, duration: 0.2, ease: 'power2.in' }, 0.7)
      .fromTo('.forge__boundary', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.12, ease: 'steps(3)' }, 0.84)
      .to('.forge__threat', { rotation: -90, y: -40, autoAlpha: 0, transformOrigin: '50% 50%', duration: 0.25, ease: 'power3.in' }, 0.9)
      .call(() => (status.textContent = 'System ready'), [], 0.95)
      // FORGE: compress to a point; the wordmark is forged from it.
      .to(forgeSvg, { scale: 0.12, rotation: 90, duration: 0.25, ease: 'power3.in' }, 1.0)
      .to(forgeSvg, { autoAlpha: 0, duration: 0.06, ease: 'none' }, 1.22)
      .fromTo('.forge__mark span', { yPercent: 105 }, { yPercent: 0, duration: 0.35, stagger: 0.015, ease: EASE.out }, 1.18)
      // REVEAL: the wordmark becomes the logo, the geometry expands into the hero.
      .to(
        mark,
        {
          x: () => nameEl.getBoundingClientRect().left - mark.getBoundingClientRect().left,
          y: () => nameEl.getBoundingClientRect().top - mark.getBoundingClientRect().top,
          scale: () => nameEl.getBoundingClientRect().height / Math.max(1, mark.getBoundingClientRect().height),
          transformOrigin: '0 0',
          duration: 0.5,
          ease: EASE.inOut,
        },
        1.6,
      )
      .from(header, { autoAlpha: 0, duration: 0.2, ease: 'none' }, 2.02)
      .set(mark, { autoAlpha: 0 }, 2.12)
      .call(() => (status.textContent = READY), [], 1.7)
      // The geometry expands out of the forged centre once the wordmark has left it…
      .fromTo(circle, { x: c.x, y: c.y, scale: 0 }, { x: 0, y: 0, scale: 1, duration: 0.8, ease: EASE.out }, 1.68)
      .fromTo(triangle, { x: t.x, y: t.y, scale: 0, rotation: 180 }, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.8, ease: EASE.out }, 1.74)
      // The precision object: the cube is machined at the core, turns once toward the
      // camera, then is set down on the beam.
      .fromTo(square, { x: sq.x, y: sq.y, scale: 0 }, { scale: 2.6, duration: 0.4, ease: EASE.out }, 1.74)
      .fromTo(spin, { rotationY: -220, rotationX: 70 }, { rotationY: 0, rotationX: 0, duration: 1.15, ease: EASE.out }, 1.74)
      .to(square, { x: 0, y: 0, scale: 1, duration: 0.7, ease: EASE.inOut }, 2.12)
      .fromTo(bar, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.6, ease: EASE.inOut }, 1.8)
      // …and the headline rises into the space it leaves.
      .from('.hero__title .mask__line', { yPercent: 110, duration: DUR.type, stagger: 0.09, ease: EASE.out }, 1.95)
      // The grid has done its job; it steps back and leaves the canvas empty.
      .to('.hero__grid-lines span', { scaleY: 0, transformOrigin: 'bottom', duration: 0.5, stagger: { each: 0.015, from: 'end' }, ease: EASE.inOut }, 1.9)
      .from('.hero__disciplines, .hero__scroll', { autoAlpha: 0, duration: DUR.meta, ease: 'none' }, 2.3);

    // Any input fast-forwards: the visitor is never made to wait.
    const hurry = (): void => {
      if (tl.progress() < 1) tl.timeScale(5);
    };
    for (const type of ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const) {
      window.addEventListener(type, hurry, { once: true, passive: true });
    }
    // Start once the type can render in its real face (0.7s at most).
    void Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 700))]).then(() => tl.play());
    return tl;
  };

  createScene(root, {
    full: () => {
      intro();
      // Cursor: the pieces sit at different depths.
      const pieces = $$('.hero__geo, .hero__bar', root);
      const depth = [0.006, 0.022, 0.034, 0.05];
      const movers = pieces.map((p) => ({
        x: gsap.quickTo(p, 'x', { duration: 1, ease: 'power3' }),
        y: gsap.quickTo(p, 'y', { duration: 1, ease: 'power3' }),
      }));
      const onMove = (e: PointerEvent): void => {
        const dx = e.clientX - window.innerWidth / 2;
        const dy = e.clientY - window.innerHeight / 2;
        movers.forEach((m, i) => {
          m.x(dx * (depth[i] ?? 0.02));
          m.y(dy * (depth[i] ?? 0.02));
        });
      };
      window.addEventListener('pointermove', onMove, { passive: true });

      // The first scroll is a camera push. The frame moves in: the type scales through
      // the lens and its lines separate in depth, the circle swells past the edge, the
      // cube turns as it comes toward us, the beam tips and the metadata runs ahead.
      const scroll = { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.2 };
      gsap.to('.hero__bar', { rotation: -7, transformOrigin: '30% 50%', ease: 'none', scrollTrigger: scroll });
      gsap.to('.hero__geo--triangle .hero__geo-v', { x: '-7vw', rotation: -30, ease: 'none', scrollTrigger: scroll });
      gsap.to(triangle, { yPercent: -60, ease: 'none', scrollTrigger: scroll });
      gsap.to('.hero__geo--square .hero__geo-v', { x: '-14vw', yPercent: -260, scale: 2.2, ease: 'none', scrollTrigger: scroll });
      gsap.to('.hero__geo--square .cube__turn', { rotationY: 200, rotationX: -40, ease: 'none', scrollTrigger: scroll });
      gsap.to('.hero__geo--circle', { scale: 1.45, transformOrigin: '70% 30%', ease: 'none', scrollTrigger: scroll });
      const lines = $$('.hero__title .mask', root);
      gsap.to(lines[0] ?? [], { x: '-8vw', ease: 'none', scrollTrigger: scroll });
      gsap.to(lines[2] ?? [], { x: '6vw', ease: 'none', scrollTrigger: scroll });
      gsap.to('.hero__title', { yPercent: -10, scale: 1.22, transformOrigin: '0% 100%', ease: 'none', scrollTrigger: scroll });
      gsap.to('.hero__system, .hero__disciplines', { y: '-18vh', ease: 'none', scrollTrigger: scroll });

      return () => window.removeEventListener('pointermove', onMove);
    },
    compact: () => {
      intro();
    },
    reduced: () => {
      status.textContent = READY;
      gsap.set(forgeEl, { display: 'none' });
      gsap.set('.hero__grid-lines span', { scaleY: 0 });
      gsap.from(root, { autoAlpha: 0, duration: 0.4, ease: 'none' });
    },
  });
}
