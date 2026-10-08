import { gsap } from './motion';

/**
 * Precision cursor: a small square that follows smoothly. Over interactive
 * elements it grows slightly and a label (VIEW, OPEN…) appears beside it. Over
 * geometry it takes that piece's shape. Desktop with a fine pointer only.
 */
export function initCursor(): void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const mark = document.createElement('span');
  mark.className = 'cursor__mark';
  const label = document.createElement('span');
  label.className = 'cursor__label';
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.append(mark, label);
  document.body.append(cursor);
  document.documentElement.classList.add('has-cursor');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const xTo = gsap.quickTo(cursor, 'x', { duration: reduced ? 0 : 0.22, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: reduced ? 0 : 0.22, ease: 'power3' });

  let shown = false;
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      if (!shown) {
        gsap.set(cursor, { x: e.clientX, y: e.clientY });
        cursor.classList.add('is-visible');
        shown = true;
      }
      xTo(e.clientX);
      yTo(e.clientY);
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => {
    cursor.classList.remove('is-visible');
    shown = false;
  });

  const INTERACTIVE = 'a, button, [data-cursor], label, summary';
  document.addEventListener('pointerover', (e) => {
    const target = e.target as Element;
    if (target.closest('input, textarea, select')) {
      cursor.dataset.state = 'text';
      return;
    }
    const el = target.closest<HTMLElement>(INTERACTIVE);
    if (el) {
      cursor.dataset.state = 'active';
      cursor.dataset.shape = '';
      label.textContent = el.dataset.cursor ?? (el.tagName === 'A' ? 'View' : 'Open');
      return;
    }
    // Geometry: the cursor briefly becomes the piece it touches.
    const geo = target.closest<HTMLElement>('[data-cursor-shape]');
    cursor.dataset.state = geo ? 'geo' : '';
    cursor.dataset.shape = geo?.dataset.cursorShape ?? '';
  });
  document.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  document.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

  // A modal <dialog> (project mode, profiles) renders in the browser's top layer,
  // above every z-index, so a cursor left on <body> would sit behind it while
  // `cursor: none` hides the native pointer. The cursor therefore always lives in
  // the topmost open modal, and comes back to <body> when it closes.
  const follow = (): void => {
    const modals = Array.from(document.querySelectorAll('dialog[open]')).filter((d) => d.matches(':modal'));
    const host = modals[modals.length - 1] ?? document.body;
    try {
      if (cursor.parentElement !== host) host.append(cursor);
      document.documentElement.classList.add('has-cursor');
    } catch {
      // Never an invisible pointer: if the custom cursor cannot follow, use the native one.
      document.documentElement.classList.remove('has-cursor');
    }
  };
  new MutationObserver(follow).observe(document.body, { subtree: true, attributeFilter: ['open'] });
}
