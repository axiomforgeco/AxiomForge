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
}
