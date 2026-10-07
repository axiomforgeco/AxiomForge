import { team } from '../data/portfolioData';
import { $ } from '../lib/dom';
import { createScene, gsap, headerOffset, isReduced, ScrollTrigger } from '../lib/motion';
import type { TeamSection } from '../sections/team';

/** Scene 1: pinned. Scroll steps through the three primitives; selecting a tab jumps there. */
export function animateTeam(section: TeamSection): void {
  const { el } = section;
  const panel = $('#team-panel', el);

  el.addEventListener('team:change', () => {
    if (isReduced()) return;
    gsap.from(panel.children, { y: 24, autoAlpha: 0, stagger: 0.06, duration: 0.4, ease: 'power3.out', overwrite: true });
    gsap.fromTo(
      el.querySelector('[aria-selected="true"] .team-tab__shape'),
      { rotation: -90 },
      { rotation: 0, duration: 0.4, ease: 'steps(2)' },
    );
  });

  createScene(el, {
    full: () => {
      const steps = team.length;
      const st = ScrollTrigger.create({
        trigger: el,
        start: () => `top ${headerOffset()}px`,
        end: '+=180%',
        pin: true,
        onUpdate: (self) => section.setActive(Math.min(steps - 1, Math.floor(self.progress * steps))),
      });
      section.onSelect((index) => {
        const top = st.start + (st.end - st.start) * ((index + 0.5) / steps);
        window.scrollTo({ top, behavior: 'smooth' });
      });
      return () => section.onSelect(() => {});
    },
  });
}
