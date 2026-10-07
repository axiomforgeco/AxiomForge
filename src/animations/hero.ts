import { $$ } from '../lib/dom';
import { createScene, gsap } from '../lib/motion';
import { splitLetters } from '../lib/splitText';

/** Scene 0: the three primitives fly in, rotate in 45°/90° steps and lock into the composition. */
export function animateHero(root: HTMLElement): void {
  const letters = $$('[data-split]', root).flatMap(splitLetters);

  const intro = (): gsap.core.Timeline =>
    gsap
      .timeline({ defaults: { ease: 'power3.inOut', duration: 1.1 } })
      .from('.hero__shape--square', { x: '-55vw', y: '35vh', rotation: -180 }, 0)
      .from('.hero__shape--circle', { x: '45vw', y: '-60vh' }, 0.1)
      .from('.hero__shape--triangle', { x: '25vw', y: '70vh', rotation: 225 }, 0.2)
      .from('.hero__bar', { scaleX: 0, duration: 0.6 }, 0.8)
      .from('.hero__dot', { scale: 0, ease: 'steps(3)', duration: 0.3 }, 1.15)
      .from('.hero__coords', { autoAlpha: 0, ease: 'steps(4)', duration: 0.4 }, 1.2)
      .from(letters, { yPercent: 110, stagger: 0.03, duration: 0.55, ease: 'power3.out' }, 0.35)
      .from('.hero__slash', { clipPath: 'inset(0 100% 0 0)', ease: 'steps(10)', duration: 0.6 }, 0.95)
      .from(
        '.eyebrow, .hero__lede, .hero__status li, .hero__actions',
        { y: 24, autoAlpha: 0, stagger: 0.07, duration: 0.5, ease: 'power3.out' },
        1.0,
      )
      .from('.scroll-cue', { autoAlpha: 0, duration: 0.4 }, 1.5);

  createScene(root, {
    full: () => {
      intro();
      // Leaving the hero, the whole composition turns a mechanical quarter turn.
      gsap.to('.hero__stage', {
        rotation: 90,
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
      });
    },
    compact: () => {
      intro();
    },
    reduced: () => {
      gsap.from('.hero__stage, .hero__copy', { autoAlpha: 0, duration: 0.4, ease: 'none' });
    },
  });
}
