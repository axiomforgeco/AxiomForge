import { team, type Shape } from '../data/portfolioData';
import { $, $$ } from '../lib/dom';
import { createScene, EASE, gsap, QA } from '../lib/motion';

const SQUARE = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
const TRIANGLE = 'polygon(50% 0%, 50% 0%, 100% 100%, 0% 100%)';

function shapeProps(shape: Shape, color: string, i: number): gsap.TweenVars {
  return {
    backgroundColor: color,
    borderRadius: shape === 'circle' ? '50%' : '0%',
    clipPath: shape === 'triangle' ? TRIANGLE : SQUARE,
    rotation: [0, 90, 360][i] ?? 0,
  };
}

/**
 * Pinned: the three compositions transform into one another. Outgoing type is
 * displaced upward through its masks while the shared shape morphs
 * (square, circle, triangle) and the next composition rises in.
 */
export function animatePeople(root: HTMLElement): void {
  const css = getComputedStyle(document.documentElement);
  const color = (accent: string): string => css.getPropertyValue(`--${accent}`).trim();

  createScene(root, {
    full: () => {
      const persons = $$('.person', root);
      const morph = $('.people__morph', root);
      const buttons = $$<HTMLButtonElement>('[data-goto]', root);
      const parts = (p: HTMLElement) => ({
        lines: $$('.mask__line', p),
        rest: $$('.person__no, .person__role, .person__rule, .person__statement, .person__disc', p),
      });

      gsap.set(morph, shapeProps(team[0]!.shape, color(team[0]!.accent), 0));
      persons.slice(1).forEach((p) => {
        const { lines, rest } = parts(p);
        gsap.set(lines, { yPercent: 110 });
        gsap.set(rest, { autoAlpha: 0 });
      });

      const tl = gsap.timeline({
        defaults: { ease: EASE.inOut },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${window.innerHeight * 2.2}`,
          pin: true,
          scrub: 0.5,
          ...(QA ? {} : { snap: { snapTo: 'labels', inertia: false, duration: { min: 0.25, max: 0.7 }, delay: 0.08, ease: EASE.inOut } }),
          onUpdate: (self) => {
            const active = Math.round(self.progress * (persons.length - 1));
            buttons.forEach((b, i) => {
              if (i === active) b.setAttribute('aria-current', 'true');
              else b.removeAttribute('aria-current');
            });
          },
        },
      });

      tl.addLabel('p0').to({}, { duration: 0.3 });
      persons.slice(0, -1).forEach((cur, i) => {
        const next = persons[i + 1]!;
        const member = team[i + 1]!;
        const a = parts(cur);
        const b = parts(next);
        tl.to(a.lines, { yPercent: -110, stagger: 0.06, duration: 1 })
          .to(a.rest, { autoAlpha: 0, y: -16, stagger: 0.03, duration: 0.4 }, '<')
          .to(morph, { ...shapeProps(member.shape, color(member.accent), i + 1), duration: 0.9, ease: EASE.mechanical }, '<0.1')
          .fromTo(b.lines, { yPercent: 110 }, { yPercent: 0, stagger: 0.06, duration: 1 }, '<0.3')
          .fromTo(b.rest, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.4 }, '<0.35')
          .addLabel(`p${i + 1}`)
          .to({}, { duration: 0.3 });
      });

      const onGoto = (e: Event): void => {
        const btn = (e.target as Element).closest<HTMLElement>('[data-goto]');
        const st = tl.scrollTrigger;
        if (!btn || !st) return;
        window.scrollTo({ top: st.labelToScroll(`p${btn.dataset.goto}`), behavior: 'smooth' });
      };
      root.addEventListener('click', onGoto);
      return () => root.removeEventListener('click', onGoto);
    },
    compact: () => {
      $$('.person', root).forEach((p) => {
        gsap.from($$('.mask__line', p), {
          yPercent: 110,
          stagger: 0.08,
          duration: 1,
          ease: EASE.out,
          scrollTrigger: { trigger: p, start: 'top 80%', once: true },
        });
        gsap.from($('.person__shape', p), {
          rotation: -90,
          scale: 0.5,
          duration: 0.6,
          ease: EASE.mechanical,
          scrollTrigger: { trigger: p, start: 'top 80%', once: true },
        });
      });
    },
  });
}
