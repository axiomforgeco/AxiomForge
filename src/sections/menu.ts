import { brand } from '../data/portfolioData';
import { h } from '../lib/dom';
import { EASE, gsap, isReduced } from '../lib/motion';
import { lockScroll } from '../lib/scroll';

/**
 * The phone navigation: a full-frame black field with the five destinations set
 * large, numbered like chapters. A modal <dialog>, so focus, Esc and the page
 * behind are handled natively; the page is held still while it is open.
 */
export function createMenu(items: { href: string; id: string; label: string; current: boolean }[]): {
  toggle: HTMLButtonElement;
  dialog: HTMLDialogElement;
} {
  const toggle = h(
    'button',
    { class: 'menu-toggle meta', type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': 'site-menu' },
    h('span', { class: 'menu-toggle__mark', 'aria-hidden': 'true' }),
    'Menu',
  );
  const close = h('button', { class: 'menu__close meta', type: 'button' }, 'Close', h('span', { 'aria-hidden': 'true' }, ' ✕'));
  const links = items.map((item, i) =>
    h(
      'li',
      {},
      h(
        'a',
        { class: 'menu__link', href: item.href, ...(item.current ? { 'aria-current': 'page' } : {}) },
        h('span', { class: 'meta menu__no', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')),
        h('span', { class: 'menu__label' }, item.label),
      ),
    ),
  );
  const dialog = h(
    'dialog',
    { class: 'menu', id: 'site-menu', 'aria-label': 'Site menu', 'data-tone': 'dark' },
    h('div', { class: 'menu__bar' }, h('span', { class: 'meta' }, brand.name), close),
    h('nav', { 'aria-label': 'Primary' }, h('ol', { class: 'menu__list' }, ...links)),
    h('p', { class: 'meta menu__foot' }, brand.descriptor),
  );

  const open = (): void => {
    dialog.showModal();
    toggle.setAttribute('aria-expanded', 'true');
    lockScroll(true);
    if (!isReduced()) {
      gsap.fromTo(dialog, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45, ease: EASE.cinematic });
      gsap.from(dialog.querySelectorAll('.menu__link'), { yPercent: 100, autoAlpha: 0, duration: 0.5, stagger: 0.05, ease: EASE.out, delay: 0.15 });
    }
  };
  const shut = (): void => {
    if (!dialog.open) return;
    dialog.close();
    toggle.setAttribute('aria-expanded', 'false');
    lockScroll(false);
    gsap.set(dialog, { clearProps: 'clipPath' });
  };

  toggle.addEventListener('click', open);
  close.addEventListener('click', () => {
    shut();
    toggle.focus();
  });
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    shut();
    toggle.focus();
  });
  // Choosing a destination closes the menu first; in-page anchors then scroll as usual.
  dialog.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) shut();
  });
  // Grown past the phone layout with the menu open: close it.
  window.matchMedia('(min-width: 40.01rem)').addEventListener('change', (e) => e.matches && shut());

  return { toggle, dialog };
}
