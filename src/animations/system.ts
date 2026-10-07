import { processStages } from '../data/portfolioData';
import { $, $$ } from '../lib/dom';
import { createScene, EASE, gsap } from '../lib/motion';
import { sound } from '../lib/sound';

const SQUARE = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
const TRIANGLE = 'polygon(50% 0%, 50% 0%, 100% 100%, 0% 100%)';

/**
 * The process runs like a machine: the line draws with scroll, the marker
 * travels it, and at each station the oversized word, the geometry and the
 * stage data switch over in discrete, mechanical steps.
 */
export function animateSystem(root: HTMLElement): void {
  const stages = $$('.stage', root);
  const words = $$('.system__word', root);
  const morph = $('.system__morph', root);
  const css = getComputedStyle(document.documentElement);

  const mark = (active: number): void => {
    stages.forEach((st, i) => {
      st.classList.toggle('is-reached', i <= active);
      st.classList.toggle('is-active', i === active);
    });
  };

  createScene(root, {
    full: () => {
      let current = 0;
      const lines = words.map((w) => $('.mask__line', w));
      gsap.set(lines.slice(1), { yPercent: 110 });
      const stageShape = (i: number): gsap.TweenVars => {
        const st = processStages[i]!;
        return {
          backgroundColor: css.getPropertyValue(`--${st.accent}`).trim(),
          borderRadius: st.shape === 'circle' ? '50%' : '0%',
          clipPath: st.shape === 'triangle' ? TRIANGLE : SQUARE,
          rotation: i * 90,
        };
      };
      gsap.set(morph, stageShape(0));
      mark(0);

      const go = (next: number): void => {
        if (next === current) return;
        const dir = next > current ? 1 : -1;
        gsap.to(lines[current]!, { yPercent: -110 * dir, duration: 0.7, ease: EASE.inOut, overwrite: true });
        gsap.fromTo(lines[next]!, { yPercent: 110 * dir }, { yPercent: 0, duration: 0.9, ease: EASE.out, overwrite: true });
        gsap.to(morph, { ...stageShape(next), duration: 0.5, ease: EASE.mechanical, overwrite: true });
        current = next;
        mark(next);
        sound.tick();
      };

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: () => `+=${window.innerHeight * 2.5}`,
            pin: true,
            scrub: 0.4,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              go(p > 0.985 ? 3 : Math.min(3, Math.floor(p * 3 + 0.02)));
            },
          },
        })
        .fromTo('.system__fill', { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
        .fromTo('.system__marker', { x: 0 }, { x: () => $('.system__line', root).offsetWidth, ease: 'none' }, 0);

      return () => mark(processStages.length - 1);
    },
    compact: () => {
      gsap.fromTo(
        '.system__fill',
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.system__track', start: 'top 70%', end: 'bottom 60%', scrub: true } },
      );
      stages.forEach((st) => {
        gsap.from(st, { autoAlpha: 0, y: 24, duration: 0.6, ease: EASE.out, scrollTrigger: { trigger: st, start: 'top 85%', once: true } });
      });
      mark(processStages.length - 1);
    },
    reduced: () => mark(processStages.length - 1),
  });
}
