import type { Shape } from '../data/portfolioData';
import { createScene, EASE, gsap, scrollBox, ScrollTrigger } from '../lib/motion';

const SQUARE = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
const TRIANGLE = 'polygon(50% 0%, 50% 0%, 100% 100%, 0% 100%)';

interface Stop {
  sel: string;
  shape: Shape;
  color: string;
}

interface Leg {
  from: Stop;
  to: Stop;
  trigger: string;
  start: string;
  endTrigger: string;
  end: string;
}

/**
 * Continuity between chapters: one piece of geometry is handed from section to
 * section. While the scroll covers the gap, both endpoints hide and a single
 * relay shape travels between their live positions, morphing shape and colour,
 * so the page reads as one evolving system. Full mode only.
 */
const legs: Leg[] = [
  {
    from: { sel: '.hero__geo--circle svg', shape: 'circle', color: 'yellow' },
    to: { sel: '.people__morph', shape: 'circle', color: 'yellow' },
    trigger: '#people',
    start: 'top bottom',
    endTrigger: '#people',
    end: 'top top',
  },
  {
    from: { sel: '.people__morph', shape: 'triangle', color: 'red' },
    to: { sel: '.panel:first-child .panel__geo svg', shape: 'triangle', color: 'red' },
    trigger: '#people',
    start: 'bottom bottom',
    endTrigger: '.work__gallery',
    end: 'top top',
  },
  {
    from: { sel: '.panel:last-child .panel__geo svg', shape: 'square', color: 'ink' },
    to: { sel: '.system__marker', shape: 'square', color: 'ink' },
    trigger: '.work__gallery',
    start: 'bottom bottom',
    endTrigger: '#system',
    end: 'top top',
  },
  {
    from: { sel: '.system__marker', shape: 'square', color: 'ink' },
    to: { sel: '.defense', shape: 'square', color: 'blue' },
    trigger: '#system',
    start: 'bottom bottom',
    endTrigger: '.security__stage',
    end: 'center 60%',
  },
  {
    from: { sel: '.defense', shape: 'square', color: 'blue' },
    to: { sel: '.payobj', shape: 'square', color: 'ink' },
    trigger: '.security__stage',
    start: 'center 40%',
    endTrigger: '.payobj',
    end: 'center 60%',
  },
];

export function initRelay(): void {
  const css = getComputedStyle(document.documentElement);
  const props = (stop: Stop): gsap.TweenVars => ({
    backgroundColor: css.getPropertyValue(`--${stop.color}`).trim(),
    borderRadius: stop.shape === 'circle' ? '50%' : '0%',
    clipPath: stop.shape === 'triangle' ? TRIANGLE : SQUARE,
  });

  createScene(document.body, {
    full: () => {
      const relay = document.createElement('div');
      relay.className = 'relay';
      relay.setAttribute('aria-hidden', 'true');
      document.body.append(relay);
      const ease = gsap.parseEase(EASE.inOut);

      const triggers = legs.map((leg) => {
        const from = document.querySelector(leg.from.sel);
        const to = document.querySelector(leg.to.sel);
        const trigger = document.querySelector<HTMLElement>(leg.trigger);
        const endTrigger = document.querySelector<HTMLElement>(leg.endTrigger);
        if (!from || !to || !trigger || !endTrigger) return null;
        const morph = gsap.utils.interpolate(props(leg.from), props(leg.to));

        const show = (on: boolean): void => {
          relay.classList.toggle('is-on', on);
          from.classList.toggle('is-relayed', on);
          to.classList.toggle('is-relayed', on);
        };

        return ScrollTrigger.create({
          trigger: scrollBox(trigger),
          start: leg.start,
          endTrigger: scrollBox(endTrigger),
          end: leg.end,
          onToggle: (self) => show(self.isActive),
          onUpdate: (self) => {
            if (!self.isActive) return;
            const e = ease(self.progress);
            const a = from.getBoundingClientRect();
            const b = to.getBoundingClientRect();
            const lerp = gsap.utils.interpolate;
            gsap.set(relay, {
              x: lerp(a.left, b.left, e),
              y: lerp(a.top, b.top, e),
              width: lerp(a.width, b.width, e),
              height: lerp(a.height, b.height, e),
              ...morph(e),
            });
          },
        });
      });

      return () => {
        triggers.forEach((t) => t?.kill());
        document.querySelectorAll('.is-relayed').forEach((el) => el.classList.remove('is-relayed'));
        relay.remove();
      };
    },
  });
}
