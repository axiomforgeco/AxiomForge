import { navLinks } from '../data/portfolioData';
import { $$ } from '../lib/dom';
import { createScene, gsap, scrollToElement, ScrollTrigger } from '../lib/motion';

/** Header progress bar: page scroll mapped to a red rule. */
function progressBar(): void {
  gsap.to('.scroll-progress span', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: true },
  });
}

/**
 * Highlights the nav link for the scene under the middle of the viewport.
 * Measures pin spacers rather than pinned sections, so long pinned scenes count in full.
 */
function activeNav(): void {
  const links = $$<HTMLAnchorElement>('[data-nav]');
  const anchors = navLinks
    .map(({ id }) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null)
    .map((el) => ({
      id: el.id,
      box: el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el,
    }));
  let current = '';

  const update = (): void => {
    const middle = window.innerHeight / 2;
    let active = '';
    for (const { id, box } of anchors) {
      const r = box.getBoundingClientRect();
      if (r.top <= middle && r.bottom > middle) active = id;
    }
    if (active === current) return;
    current = active;
    links.forEach((link) => {
      if (link.dataset.nav === active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update });
}

/** In-page links: smooth (or instant) scroll that respects pins, then move focus for keyboard users. */
function anchorLinks(): void {
  document.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    const id = link?.getAttribute('href')?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!link || !target) return;
    event.preventDefault();
    scrollToElement(target);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.replaceState(null, '', `#${id}`);
  });
}

/** Section titles slide up as each scene arrives. */
function sectionTitles(): void {
  createScene(document.body, {
    full: () => reveal(),
    compact: () => reveal(),
  });
  function reveal(): void {
    for (const title of $$('.section-head__title')) {
      gsap.from(title, {
        yPercent: 60,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: title, start: 'top 88%', once: true },
      });
    }
  }
}

export function animateSite(): void {
  progressBar();
  sectionTitles();
  activeNav();
  anchorLinks();
}
