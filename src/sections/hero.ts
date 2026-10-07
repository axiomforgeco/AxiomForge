import { chapterCount } from '../data/portfolioData';
import { h, maskLines, shapeSvg } from '../lib/dom';
import type { Shape } from '../data/portfolioData';

/** One geometric piece: position wrapper (cursor) › velocity layer › shape (intro + scroll). */
function piece(shape: Shape, color: 'yellow' | 'red' | 'blue', name: string): HTMLElement {
  return h(
    'div',
    { class: `hero__geo hero__geo--${name}`, 'aria-hidden': 'true', 'data-cursor-shape': shape },
    h('div', { class: 'hero__geo-v', 'data-velocity': 'drift' }, shapeSvg(shape, color)),
  );
}

export function renderHero(): HTMLElement {
  return h(
    'section',
    { id: 'top', class: 'hero', 'aria-labelledby': 'hero-title' },
    h('div', { class: 'hero__grid-lines', 'aria-hidden': 'true' }, ...Array.from({ length: 13 }, () => h('span'))),
    h('p', { class: 'hero__system meta' }, h('span', {}, `01 / ${chapterCount}`), h('span', {}, 'Digital systems studio')),
    h(
      'div',
      { class: 'hero__title-wrap', 'data-velocity': 'stretch' },
      maskLines('h1', ['We build', 'digital', 'systems.'], { id: 'hero-title', class: 'display hero__title' }),
    ),
    h('div', { class: 'hero__bar', 'aria-hidden': 'true' }, h('div', { class: 'hero__geo-v', 'data-velocity': 'drift' })),
    piece('circle', 'yellow', 'circle'),
    piece('triangle', 'red', 'triangle'),
    piece('square', 'blue', 'square'),
    h('p', { class: 'hero__disciplines meta' }, `Engineering / Design / Security — ${new Date().getFullYear()}`),
    h('a', { class: 'hero__scroll', href: '#philosophy', 'aria-label': 'Scroll to philosophy', 'data-cursor': 'Scroll' }, h('span', { class: 'hero__scroll-line', 'aria-hidden': 'true' })),
  );
}
