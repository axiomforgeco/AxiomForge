import { $$ } from '../lib/dom';
import { createScene, gsap } from '../lib/motion';

/**
 * The statement is read into existence: words resolve as they cross the viewport.
 * The principles below stay still on purpose; the rhythm needs a silence.
 */
export function animatePhilosophy(root: HTMLElement): void {
  const reveal = (): void => {
    gsap.fromTo(
      $$('.philosophy__statement .word', root),
      { opacity: 0.16 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: '.philosophy__statement', start: 'top 78%', end: 'bottom 50%', scrub: true },
      },
    );
  };
  createScene(root, { full: reveal, compact: reveal });
}
