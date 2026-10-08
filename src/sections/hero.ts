import { brand, chapterCount } from '../data/portfolioData';
import { cube, h, maskLines, s as svg, shapeSvg } from '../lib/dom';
import type { Shape } from '../data/portfolioData';

/** One geometric piece: position wrapper (cursor) › velocity layer › shape (intro + scroll). */
function piece(shape: Shape, color: 'yellow' | 'red' | 'blue', name: string): HTMLElement {
  return h(
    'div',
    { class: `hero__geo hero__geo--${name}`, 'aria-hidden': 'true', 'data-cursor-shape': shape },
    h('div', { class: 'hero__geo-v', 'data-velocity': 'drift' }, shapeSvg(shape, color)),
  );
}

/**
 * The forge: four tiny systems drawn in under a second (interface frame, software
 * nodes, cloud orbit, security boundary) that compress into the wordmark. About
 * thirty lightweight SVG nodes; it is removed once the intro has played.
 */
function forge(): HTMLElement {
  const line = (d: string, cls: string) => svg('path', { d, class: cls, pathLength: 1 });
  const nodes = [
    [56, 50],
    [96, 50],
    [136, 50],
    [76, 80],
    [116, 80],
  ].map(([x, y]) => svg('rect', { class: 'forge__node', x: x!, y: y!, width: 8, height: 8 }));
  const dots = [-60, 60, 180].map((deg) => {
    const r = (deg * Math.PI) / 180;
    return svg('circle', { class: 'forge__dot', cx: (100 + 62 * Math.cos(r)).toFixed(1), cy: (65 + 62 * Math.sin(r)).toFixed(1), r: 3.2 });
  });
  return h(
    'div',
    { class: 'forge', 'aria-hidden': 'true' },
    svg(
      'svg',
      { class: 'forge__svg', viewBox: '-20 -10 240 150', focusable: 'false' },
      // 01 Frontend: an interface frame.
      line('M30 20 H170 V110 H30 Z', 'forge__frame'),
      line('M30 32 H170', 'forge__frame'),
      // 02 Software: structured nodes and their connections.
      line('M64 54 H96 M104 54 H136 M60 58 L80 80 M100 58 L80 80 M100 58 L120 80 M140 58 L120 80', 'forge__wire'),
      ...nodes,
      // 03 Cloud: an orbit with infrastructure nodes.
      svg('circle', { class: 'forge__orbit', cx: 100, cy: 65, r: 62, pathLength: 1 }),
      ...dots,
      // 04 Security: a boundary forms; the threat is turned away.
      line('M22 12 H178 V118 H22 Z', 'forge__boundary'),
      svg('polygon', { class: 'forge__threat', points: '-18,58 -2,65 -18,72' }),
    ),
    h('p', { class: 'forge__mark' }, ...Array.from(brand.name).map((c) => h('span', {}, c))),
  );
}

export function renderHero(): HTMLElement {
  return h(
    'section',
    { id: 'top', class: 'hero', 'aria-labelledby': 'hero-title' },
    h('div', { class: 'hero__grid-lines', 'aria-hidden': 'true' }, ...Array.from({ length: 13 }, () => h('span'))),
    forge(),
    h('p', { class: 'hero__system meta' }, h('span', {}, `01 / ${chapterCount}`), h('span', {}, 'Digital systems studio')),
    h(
      'div',
      { class: 'hero__title-wrap', 'data-velocity': 'stretch' },
      maskLines('h1', ['We build', 'digital', 'systems.'], { id: 'hero-title', class: 'display hero__title' }),
    ),
    h('div', { class: 'hero__bar', 'aria-hidden': 'true' }, h('div', { class: 'hero__geo-v', 'data-velocity': 'drift' })),
    piece('circle', 'yellow', 'circle'),
    piece('triangle', 'red', 'triangle'),
    // The precision object: a machined cube resting on the beam.
    h('div', { class: 'hero__geo hero__geo--square', 'aria-hidden': 'true', 'data-cursor-shape': 'square' }, h('div', { class: 'hero__geo-v', 'data-velocity': 'drift' }, cube('cobalt'))),
    h('p', { class: 'hero__disciplines meta' }, `Software / Cloud / Web / Security — ${new Date().getFullYear()}`),
    h('a', { class: 'hero__scroll', href: '#philosophy', 'aria-label': 'Scroll to philosophy', 'data-cursor': 'Scroll' }, h('span', { class: 'hero__scroll-line', 'aria-hidden': 'true' })),
  );
}
