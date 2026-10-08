import { $, $$ } from '../lib/dom';
import { createScene, EASE, gsap } from '../lib/motion';
import { scrollToY } from '../lib/scroll';

/** Phase split of the pinned scroll: three focus states, then the forge. */
const FOCUS_END = 0.6;
// Positions on the beam, by team order (Himanshu, Saurabh, Ayan): Ayan left, Himanshu centre, Saurabh right.
const BEAM_SLOT = [0, 1, -1];

/**
 * People as three subsystems. Scroll moves the focus 01 → 02 → 03: the focused
 * identity becomes dominant, its symbol grows in its own way (structure, orbit,
 * vector), and the other two step back. Hovering or choosing a name takes focus
 * immediately. Then the three systems connect: their symbols travel onto one beam
 * and AXIOMFORGE is forged from them, the bridge into the work.
 */
export function animatePeople(root: HTMLElement): void {
  const stage = $('.people__stage', root);
  const idents = $$('.ident', root);
  const buttons = $$<HTMLButtonElement>('[data-goto]', root);

  const focus = (i: number | 'all'): void => {
    stage.dataset.active = String(i);
    idents.forEach((el, k) => el.classList.toggle('is-active', i === k));
    buttons.forEach((b, k) => {
      if (k === i) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
  };

  createScene(root, {
    full: () => {
      let scrolled = 0;
      let hovering: number | null = null;
      focus(0);

      const geos = idents.map((el) => $('.ident__geo', el));
      const texts = idents.flatMap((el) => $$('.ident__no, .ident__name, .ident__role, .ident__line, .ident__actions', el));
      // Where each symbol lands: on the beam, in a row, centred in the stage. Measured
      // against the final equal-column layout, because the columns are still easing back
      // from the focus state when the forge begins.
      const target = (k: number) => {
        const W = stage.clientWidth;
        const G = parseFloat(getComputedStyle(stage).columnGap) || 0;
        const col = (W - 2 * G) / 3;
        const geo = geos[k]!;
        const s = stage.getBoundingClientRect();
        const g = geo.getBoundingClientRect();
        const gap = Math.min(W * 0.12, 170);
        const finalCentre = k * (col + G) + geo.offsetWidth / 2;
        return {
          x: W / 2 + (BEAM_SLOT[k] ?? 0) * gap - finalCentre,
          y: s.height * 0.5 - (g.top - s.top + g.height / 2) - g.height * 0.25,
        };
      };

      const run = gsap.timeline({ defaults: { ease: EASE.inOut } });
      run.to({}, { duration: 3 }); // the three focus states are triggered, not scrubbed
      const t = run.duration();
      run
        .to(texts, { autoAlpha: 0, y: -18, duration: 0.4, stagger: 0.01, ease: 'power2.in' }, t)
        .to(idents, { borderTopColor: 'rgba(17, 17, 17, 0)', duration: 0.4, ease: 'none' }, t)
        .fromTo('.people__beam', { scaleX: 0 }, { scaleX: 1, duration: 0.6 }, t + 0.2)
        .to(geos, { x: (k: number) => target(k).x, y: (k: number) => target(k).y, scale: 0.5, duration: 0.9, ease: EASE.mechanical, stagger: 0.06 }, t + 0.3)
        .fromTo('.people__mark span', { yPercent: 105 }, { yPercent: 0, duration: 0.6, stagger: 0.03, ease: EASE.out }, t + 1.05)
        .fromTo('.people__equation', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'none' }, t + 1.5)
        .to({}, { duration: 0.6 });

      const pinned = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${window.innerHeight * 3.4}`,
          pin: true,
          anticipatePin: 1,
          scrub: 0.3,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (self.progress >= FOCUS_END) {
              hovering = null;
              focus('all');
              return;
            }
            scrolled = Math.min(2, Math.floor((self.progress / FOCUS_END) * 3));
            if (hovering === null) focus(scrolled);
          },
        },
      });
      pinned.add(run);

      // Hover gives focus immediately; leaving hands it back to the scroll.
      const enter = (e: Event): void => {
        const st = pinned.scrollTrigger;
        if (!st || st.progress >= FOCUS_END) return;
        hovering = idents.indexOf(e.currentTarget as HTMLElement);
        focus(hovering);
      };
      const leave = (): void => {
        const st = pinned.scrollTrigger;
        hovering = null;
        if (st && st.progress < FOCUS_END) focus(scrolled);
      };
      idents.forEach((el) => {
        el.addEventListener('pointerenter', enter);
        el.addEventListener('pointerleave', leave);
      });
      const onGoto = (e: Event): void => {
        const btn = (e.target as Element).closest<HTMLElement>('[data-goto]');
        const st = pinned.scrollTrigger;
        if (!btn || !st) return;
        const k = Number(btn.dataset.goto);
        scrollToY(st.start + (st.end - st.start) * FOCUS_END * ((k + 0.5) / 3));
      };
      root.addEventListener('click', onGoto);

      return () => {
        idents.forEach((el) => {
          el.removeEventListener('pointerenter', enter);
          el.removeEventListener('pointerleave', leave);
        });
        root.removeEventListener('click', onGoto);
        delete stage.dataset.active;
        idents.forEach((el) => el.classList.remove('is-active'));
      };
    },
    compact: () => {
      idents.forEach((el) => {
        gsap.from($('.ident__shape', el), {
          rotation: -90,
          scale: 0.5,
          duration: 0.6,
          ease: EASE.mechanical,
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        });
      });
      gsap.from('.people__mark span', {
        yPercent: 105,
        stagger: 0.03,
        duration: 0.7,
        ease: EASE.out,
        scrollTrigger: { trigger: '.people__forge', start: 'top 85%', once: true },
      });
    },
  });
}
