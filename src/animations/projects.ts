import { $, $$ } from '../lib/dom';
import { createScene, gsap, headerOffset, ScrollTrigger } from '../lib/motion';

/** Scene 2: pinned horizontal tunnel. Cards lean with scroll velocity, then settle square. */
export function animateProjects(el: HTMLElement): void {
  const viewport = $('.projects__viewport', el);
  const track = $('.projects__track', el);
  const counter = $('[data-project-index]', el);
  const cards = $$('.project-card', el);
  const setCounter = (i: number): void => {
    counter.textContent = String(i + 1).padStart(2, '0');
  };

  createScene(el, {
    full: () => {
      const distance = (): number => Math.max(0, track.scrollWidth - viewport.clientWidth);
      const proxy = { skew: 0 };
      const setSkew = gsap.quickSetter(cards, 'skewX', 'deg');
      const clamp = gsap.utils.clamp(-7, 7);

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: () => `top ${headerOffset()}px`,
          end: () => `+=${distance()}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setCounter(Math.round(self.progress * (cards.length - 1)));
            const skew = clamp(self.getVelocity() / -350);
            if (Math.abs(skew) > Math.abs(proxy.skew)) {
              proxy.skew = skew;
              gsap.to(proxy, {
                skew: 0,
                duration: 0.7,
                ease: 'power3',
                overwrite: true,
                onUpdate: () => setSkew(proxy.skew),
              });
            }
          },
        },
      });

      // Keyboard users tab into off-screen cards: scroll the page to that card instead
      // of letting the browser scroll the clipped viewport.
      const onFocus = (event: FocusEvent): void => {
        const card = (event.target as Element).closest<HTMLElement>('.project-card');
        const st = tween.scrollTrigger;
        if (!card || !st) return;
        viewport.scrollLeft = 0;
        const ratio = Math.min(1, card.offsetLeft / Math.max(1, distance()));
        window.scrollTo({ top: st.start + (st.end - st.start) * ratio });
      };
      track.addEventListener('focusin', onFocus);
      return () => track.removeEventListener('focusin', onFocus);
    },
    compact: () => {
      gsap.set(cards, { autoAlpha: 0, y: 48 });
      ScrollTrigger.batch(cards, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out' }),
      });
    },
  });
}
