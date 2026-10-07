import { $, $$ } from '../lib/dom';
import { createScene, DUR, EASE, gsap } from '../lib/motion';

/**
 * The signature moment. On an almost empty canvas the system label ticks in and
 * the grid draws itself. Four pieces arrive from four directions, meet and overlap
 * for a beat, then each turns and locks into the final composition. The type rises,
 * the grid steps back, and only the composition remains.
 */
export function animateHero(root: HTMLElement): void {
  const header = $('.site-header');
  const circle = $('.hero__geo--circle svg', root);
  const triangle = $('.hero__geo--triangle svg', root);
  const square = $('.hero__geo--square svg', root);
  const bar = $('.hero__bar .hero__geo-v', root);

  const intro = (): gsap.core.Timeline => {
    // Meeting point: just above the bar, under the circle.
    const meet = { x: window.innerWidth * 0.76, y: window.innerHeight * 0.42 };
    const toMeet = (el: Element): { x: number; y: number } => {
      const r = el.getBoundingClientRect();
      return { x: meet.x - (r.left + r.width / 2), y: meet.y - (r.top + r.height / 2) };
    };
    const c = toMeet(circle);
    const t = toMeet(triangle);
    const s = toMeet(square);
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    return gsap
      .timeline({ defaults: { ease: EASE.mechanical } })
      .from('.hero__system', { clipPath: 'inset(0 100% 0 0)', duration: DUR.meta, ease: 'steps(10)' }, 0)
      .fromTo('.hero__grid-lines span', { scaleY: 0, transformOrigin: 'top' }, { scaleY: 1, duration: 0.6, stagger: 0.02, ease: EASE.inOut }, 0.1)
      // Arrive from four directions and overlap at the meeting point…
      .fromTo(circle, { x: c.x, y: c.y - vh * 0.7 }, { x: c.x, y: c.y, duration: 0.55 }, 0.3)
      .fromTo(triangle, { x: t.x + vw * 0.45, y: t.y, rotation: 180 }, { x: t.x, y: t.y, rotation: 90, duration: 0.55 }, 0.36)
      .fromTo(square, { x: s.x, y: s.y + vh * 0.7, rotation: 45 }, { x: s.x, y: s.y, rotation: 90, duration: 0.55 }, 0.42)
      .fromTo(bar, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.7, ease: EASE.inOut }, 0.45)
      // …hold for a beat, then each piece turns a quarter and locks into place.
      .to([circle, triangle, square], { x: 0, y: 0, rotation: 0, duration: 0.6, ease: EASE.out, stagger: 0.06 }, 1.05)
      .from('.hero__title .mask__line', { yPercent: 110, duration: DUR.type, stagger: 0.09, ease: EASE.out }, 0.7)
      // The grid has done its job; it steps back and leaves the canvas empty.
      .to('.hero__grid-lines span', { scaleY: 0, transformOrigin: 'bottom', duration: 0.6, stagger: { each: 0.02, from: 'end' }, ease: EASE.inOut }, 1.35)
      .from('.hero__disciplines, .hero__scroll', { autoAlpha: 0, duration: DUR.meta, ease: 'none' }, 1.5)
      .from(header, { autoAlpha: 0, y: -10, duration: 0.6, ease: EASE.out }, 1.5);
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

      // Leaving the hero, layers separate at different speeds.
      const scroll = { trigger: root, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to(triangle, { yPercent: -120, ease: 'none', scrollTrigger: scroll });
      gsap.to(square, { yPercent: -260, ease: 'none', scrollTrigger: scroll });
      gsap.to('.hero__title', { yPercent: -10, ease: 'none', scrollTrigger: scroll });

      return () => window.removeEventListener('pointermove', onMove);
    },
    compact: () => {
      intro();
    },
    reduced: () => {
      gsap.set('.hero__grid-lines span', { scaleY: 0 });
      gsap.from(root, { autoAlpha: 0, duration: 0.4, ease: 'none' });
    },
  });
}
