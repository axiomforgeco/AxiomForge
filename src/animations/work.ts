import { $, $$ } from '../lib/dom';
import { createScene, DUR, EASE, gsap, QA, scrollBox } from '../lib/motion';

const HOLD = 1;
const CHANGE = 1.4;

/** Transform origin inside the first letter's left stroke, so the zoom dives into a letterform. */
function letterOrigin(title: HTMLElement): string {
  const text = title.firstChild;
  const t = title.getBoundingClientRect();
  if (!text || !t.width) return '2% 55%';
  const range = document.createRange();
  range.setStart(text, 0);
  range.setEnd(text, 1);
  const c = range.getBoundingClientRect();
  const x = ((c.left - t.left + c.width * 0.14) / t.width) * 100;
  return `${x.toFixed(2)}% 55%`;
}

/**
 * Selected work as one continuous motion system. Posters share a pinned stage.
 * During a hold the title grows slightly, geometry moves and metadata drifts.
 * In a change, metadata and geometry leave fast; the title dives into its first
 * letter while letter and field turn the next poster's colour, so the next
 * composition is revealed through the typography. Then the next title rises.
 */
export function animateWork(root: HTMLElement): void {
  const gallery = $('.work__gallery', root);
  const panels = $$('.panel', root);
  const indexEl = $('[data-work-index]', root);
  const bar = $('.work__progress-bar span', root);
  const progress = $('.work__progress', root);
  const css = getComputedStyle(document.documentElement);
  const isDark = (p: HTMLElement): boolean => p.matches('.panel--ink, .panel--charcoal');
  const bg = (p: HTMLElement): string =>
    css.getPropertyValue(p.matches('.panel--ink') ? '--ink' : p.matches('.panel--charcoal') ? '--charcoal' : '--paper').trim();
  const parts = (p: HTMLElement) => ({
    no: $('.panel__no', p),
    meta: $('.panel__meta', p),
    geo: $('.panel__geo', p),
    title: $('.panel__title', p),
    year: p.querySelector<HTMLElement>('.panel__year'),
  });

  createScene(root, {
    full: () => {
      const last = panels.length - 1;
      gsap.set(panels.slice(1), { autoAlpha: 0 });
      progress.dataset.tone = isDark(panels[0]!) ? 'light' : 'dark';

      const tl = gsap.timeline({ defaults: { ease: EASE.inOut } });
      const swaps: number[] = [];
      tl.addLabel('p0', 0);
      panels.forEach((panel, i) => {
        const cur = parts(panel);
        // Hold: the poster comes alive without changing.
        const hold = tl.labels[`p${i}`] ?? 0;
        tl.to(cur.title, { scale: 1.06, duration: HOLD, ease: 'none' }, hold)
          .to(cur.geo, { yPercent: -8, rotation: 12, duration: HOLD, ease: 'none' }, hold)
          .to(cur.meta, { x: '-2vw', duration: HOLD, ease: 'none' }, hold);

        const next = panels[i + 1];
        if (!next) return;
        const nx = parts(next);
        // Numeric positions: chained relative offsets ("p0+=1+=1.2") are not valid GSAP syntax.
        const at = (tl.labels[`p${i}`] ?? 0) + HOLD;
        const swap = at + CHANGE - 0.2;
        swaps.push(swap);
        tl.to([cur.meta, cur.no, cur.year].filter(Boolean), { x: '-8vw', autoAlpha: 0, duration: DUR.meta, ease: 'power2.in', stagger: 0.04 }, at)
          .to(cur.geo, { rotation: 102, scale: 0.4, autoAlpha: 0, duration: 0.5, ease: EASE.mechanical }, at)
          .set(cur.title, { transformOrigin: letterOrigin(cur.title) }, at)
          .to(cur.title, { scale: 14, duration: 1.1, ease: 'power3.in' }, at + 0.1)
          // A short dissolve while the letterform fills the frame: no muddy mid-tones linger.
          .to(cur.title, { color: bg(next), duration: 0.3, ease: 'power2.inOut' }, at + 0.85)
          .to(panel, { backgroundColor: bg(next), duration: 0.3, ease: 'power2.inOut' }, at + 0.85)
          .set(panel, { autoAlpha: 0 }, swap)
          .set(next, { autoAlpha: 1 }, swap)
          .set(progress, { attr: { 'data-tone': isDark(next) ? 'light' : 'dark' } }, swap)
          .fromTo(nx.title, { yPercent: 105 }, { yPercent: 0, duration: 0.8, ease: EASE.out, immediateRender: false }, swap)
          .fromTo(nx.geo, { scale: 0.3, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.6, ease: EASE.mechanical, immediateRender: false }, swap + 0.1)
          .fromTo([nx.no, nx.meta, nx.year].filter(Boolean), { x: '6vw', autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: DUR.meta, stagger: 0.04, ease: 'power2.out', immediateRender: false }, swap + 0.2)
          .addLabel(`p${i + 1}`, swap + 0.9);
      });

      // Snap points sit in the middle of each hold: the scroll never rests mid-change.
      const holds = panels.map((_, k) => ((tl.labels[`p${k}`] ?? 0) + HOLD * 0.5) / tl.duration());
      const nearest = (value: number): number =>
        holds.reduce((best, h) => (Math.abs(h - value) < Math.abs(best - value) ? h : best), holds[0] ?? 0);

      const pinned = gsap.timeline({
        scrollTrigger: {
          trigger: gallery,
          start: 'top top',
          end: () => `+=${window.innerHeight * (panels.length * 0.9 + last * 1.1)}`,
          pin: true,
          scrub: 0.6,
          ...(QA ? {} : { snap: { snapTo: nearest, inertia: false, duration: { min: 0.3, max: 0.9 }, delay: 0.08, ease: EASE.inOut } }),
          onUpdate: (self) => {
            const t = self.progress * tl.duration();
            const i = swaps.filter((sw) => t >= sw).length;
            indexEl.textContent = String(i + 1).padStart(2, '0');
            gsap.set(bar, { scaleX: self.progress });
          },
        },
      });
      pinned.add(tl);

      // Keyboard users tab to a poster that is not on stage: move the scroll to its hold.
      const onFocus = (event: FocusEvent): void => {
        const panel = (event.target as Element).closest<HTMLElement>('.panel');
        if (!panel) return;
        const box = scrollBox(gallery);
        const top = box.getBoundingClientRect().top + window.scrollY;
        const span = box.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + span * (holds[panels.indexOf(panel)] ?? 0) });
      };
      gallery.addEventListener('focusin', onFocus);
      return () => gallery.removeEventListener('focusin', onFocus);
    },
    compact: () => {
      panels.forEach((panel) => {
        const st = { trigger: panel, start: 'top 75%', once: true };
        gsap.from($('.panel__title', panel), { yPercent: 40, autoAlpha: 0, duration: 1, ease: EASE.out, scrollTrigger: st });
        gsap.from($('.panel__geo', panel), { rotation: -90, scale: 0.5, duration: 0.6, ease: EASE.mechanical, scrollTrigger: st });
      });
    },
  });
}
