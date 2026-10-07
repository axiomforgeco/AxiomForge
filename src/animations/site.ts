import { chapters } from '../data/portfolioData';
import { $, $$ } from '../lib/dom';
import { createScene, DUR, EASE, gsap, scrollBox, scrollToElement, ScrollTrigger } from '../lib/motion';

/** Overlay header at the top; compact fixed system bar once the page moves. */
function headerState(): void {
  const header = $('.site-header');
  ScrollTrigger.create({
    start: 80,
    end: 'max',
    onToggle: (self) => header.classList.toggle('is-compact', self.isActive),
  });
}

/** Telemetry (scroll %, chapter number) and the geometric active-nav marker. */
function telemetry(): void {
  const scrollOut = $('[data-telemetry="scroll"]');
  const chapterOut = $('[data-telemetry="chapter"]');
  const links = $$<HTMLAnchorElement>('[data-nav]');
  const boxes: { id: string; no: string; el: HTMLElement }[] = [];
  chapters.forEach((c, i) => {
    const el = document.getElementById(c.id);
    if (el) boxes.push({ id: c.id, no: String(i + 1).padStart(2, '0'), el });
  });
  let current = '';

  const update = (progress: number): void => {
    scrollOut.textContent = String(Math.round(progress * 100)).padStart(3, '0');
    const middle = window.innerHeight / 2;
    let active = boxes[0];
    for (const b of boxes) {
      if (scrollBox(b.el).getBoundingClientRect().top <= middle) active = b;
    }
    if (!active || active.id === current) return;
    current = active.id;
    chapterOut.textContent = active.no;
    links.forEach((link) => {
      if (link.dataset.nav === current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => update(self.progress),
    onRefresh: (self) => update(self.progress),
  });
}

/** In-page links: smooth (or instant) scroll that respects pins, then focus for keyboard users. */
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

/**
 * Shared reveals, following the motion language: chapter labels tick in fast,
 * display type rises slow and weighted through its masks.
 */
function reveals(): void {
  const run = (): void => {
    for (const label of $$('.section .chapter-label, .work .chapter-label')) {
      gsap.from(label, {
        clipPath: 'inset(0 100% 0 0)',
        duration: DUR.meta,
        ease: 'steps(10)',
        scrollTrigger: { trigger: label, start: 'top 90%', once: true },
      });
    }
    for (const heading of $$('.section .masked.display:not(.person__lines):not(.system__word), .site-footer .masked')) {
      gsap.from($$('.mask__line', heading), {
        yPercent: 110,
        stagger: 0.1,
        duration: DUR.type,
        ease: EASE.out,
        scrollTrigger: { trigger: heading, start: 'top 85%', once: true },
      });
    }
  };
  createScene(document.body, { full: run, compact: run });
}

/** The page ends in silence: the last primitive slowly leaves the frame. */
function footerExit(): void {
  createScene(document.body, {
    full: () => {
      gsap.fromTo(
        '.site-footer__orb',
        { yPercent: -30 },
        {
          yPercent: 70,
          ease: 'none',
          scrollTrigger: { trigger: '.site-footer', start: 'top bottom', end: 'bottom bottom', scrub: true },
        },
      );
    },
  });
}

export function animateSite(): void {
  headerState();
  telemetry();
  anchorLinks();
  reveals();
  footerExit();
}
