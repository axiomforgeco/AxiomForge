import { $$ } from '../lib/dom';
import { createScene, EASE, gsap } from '../lib/motion';

/**
 * The archive moves like the rest of the site, but quieter: each entry's geometry
 * turns and drifts against the scroll like an object passing the camera, the
 * index rows tick in, and the case-study blocks arrive in reading order.
 */
export function animateArchive(root: HTMLElement): void {
  const run = (): void => {
    gsap.from($$('.archive__index li, .archive__index-head', root), {
      yPercent: 100,
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.04,
      ease: EASE.out,
      scrollTrigger: { trigger: '.archive__index', start: 'top 90%', once: true },
    });
    for (const entry of $$('.entry, .row-entry, .initiative, .operating', root)) {
      const blocks = $$('.entry__summary, .entry__block, .entry__actions, .initiative__summary, .operating__more', entry);
      gsap.from(blocks, {
        y: 28,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: EASE.out,
        scrollTrigger: { trigger: entry, start: 'top 70%', once: true },
      });
    }
  };

  createScene(root, {
    full: () => {
      run();
      for (const entry of $$('.entry', root)) {
        const geo = entry.querySelector('.entry__geo');
        if (!geo) continue;
        const dir = entry.classList.contains('entry--b') ? -1 : 1;
        gsap.fromTo(
          geo,
          { yPercent: 40, rotation: -40 * dir },
          {
            yPercent: -40,
            rotation: 40 * dir,
            ease: 'none',
            scrollTrigger: { trigger: entry, start: 'top bottom', end: 'bottom top', scrub: 0.4 },
          },
        );
      }
    },
    compact: run,
  });
}
