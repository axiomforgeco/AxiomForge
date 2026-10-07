import { $$ } from './dom';
import { createScene, gsap, ScrollTrigger } from './motion';

/**
 * Scroll velocity makes the page feel physical. Fast scrolling slightly skews
 * project titles, stretches display type, pushes geometry and runs metadata
 * ahead; when scrolling stops, everything settles back exactly. Full mode only.
 *
 *   [data-velocity="skew"]     skewY
 *   [data-velocity="stretch"]  scaleY
 *   [data-velocity="drift"]    y (geometry lags behind the scroll)
 *   [data-velocity="meta"]     x (metadata runs ahead)
 */
export function initVelocity(): void {
  createScene(document.body, {
    full: () => {
      const setter = (kind: string, prop: string, unit?: string) => {
        const els = $$(`[data-velocity="${kind}"]`);
        return { els, set: els.length ? gsap.quickSetter(els, prop, unit) : null };
      };
      const skew = setter('skew', 'skewY', 'deg');
      const stretch = setter('stretch', 'scaleY');
      const drift = setter('drift', 'y', 'px');
      const meta = setter('meta', 'x', 'px');
      const clamp = gsap.utils.clamp(-1, 1);
      const proxy = { v: 0 };

      const apply = (): void => {
        skew.set?.(proxy.v * -3);
        stretch.set?.(1 + Math.abs(proxy.v) * 0.05);
        drift.set?.(proxy.v * -36);
        meta.set?.(proxy.v * 18);
      };

      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const v = clamp(self.getVelocity() / 3000);
          if (Math.abs(v) > Math.abs(proxy.v)) {
            proxy.v = v;
            gsap.to(proxy, { v: 0, duration: 0.9, ease: 'power3', overwrite: true, onUpdate: apply });
          }
        },
      });
      return () => {
        gsap.set(skew.els, { skewY: 0 });
        gsap.set(stretch.els, { scaleY: 1 });
        gsap.set(drift.els, { y: 0 });
        gsap.set(meta.els, { x: 0 });
      };
    },
  });
}
