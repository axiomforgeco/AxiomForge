import { chapterNo, type Accent, type Shape } from '../data/portfolioData';

type Child = Node | string | number | false | null | undefined;
type AttrValue = string | number | boolean | undefined;

/**
 * Tiny element builder. Text children become text nodes, so content is never
 * parsed as HTML (no innerHTML anywhere, which is our XSS rule).
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, AttrValue> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  setAttrs(el, attrs);
  el.append(...toNodes(children));
  return el;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export function s<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, AttrValue> = {},
  ...children: Child[]
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  setAttrs(el, attrs);
  el.append(...toNodes(children));
  return el;
}

function setAttrs(el: Element, attrs: Record<string, AttrValue>): void {
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    el.setAttribute(key, value === true ? '' : String(value));
  }
}

function toNodes(children: Child[]): (Node | string)[] {
  return children
    .filter((c): c is Node | string | number => c !== false && c !== null && c !== undefined)
    .map((c) => (typeof c === 'number' ? String(c) : c));
}

export type ShapeColor = Accent | 'paper';

/** Decorative geometric primitive, hidden from assistive tech. */
export function shapeSvg(shape: Shape, color: ShapeColor, className = ''): SVGSVGElement {
  const fill = `var(--${color})`;
  const body =
    shape === 'square'
      ? s('rect', { x: 0, y: 0, width: 100, height: 100, fill })
      : shape === 'circle'
        ? s('circle', { cx: 50, cy: 50, r: 50, fill })
        : s('polygon', { points: '50,0 100,100 0,100', fill });
  return s(
    'svg',
    {
      class: `shape shape--${shape} ${className}`.trim(),
      viewBox: '0 0 100 100',
      'aria-hidden': 'true',
      focusable: 'false',
    },
    body,
  );
}

/**
 * The precision object: a machined CSS 3D cube. `.cube` holds the size and the
 * perspective, `.cube__spin` and `.cube__turn` are free for animation (one for timed
 * motion, one for scroll, so they never fight), `.cube__body` keeps the resting
 * three-quarter view. Six faces, no WebGL. `tone` picks the face set.
 */
export function cube(tone: 'cobalt' | 'ink' | 'red' = 'cobalt', className = ''): HTMLElement {
  const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'].map((f) => h('span', { class: `cube__face cube__face--${f}` }));
  return h(
    'div',
    { class: `cube cube--${tone} ${className}`.trim(), 'aria-hidden': 'true' },
    h('div', { class: 'cube__spin' }, h('div', { class: 'cube__turn' }, h('div', { class: 'cube__body' }, ...faces))),
  );
}

export function $<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

export function $$<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/**
 * A heading whose lines sit in overflow masks, ready for weighted line reveals.
 * Lines are separate blocks visually but read as one sentence.
 */
export function maskLines<K extends 'h1' | 'h2' | 'h3' | 'p'>(
  tag: K,
  lines: readonly string[],
  attrs: Record<string, AttrValue> = {},
): HTMLElementTagNameMap[K] {
  const el = h(tag, { ...attrs, class: `${String(attrs.class ?? '')} masked`.trim() });
  lines.forEach((line, i) => {
    el.append(h('span', { class: 'mask' }, h('span', { class: 'mask__line' }, line)));
    if (i < lines.length - 1) el.append(' ');
  });
  return el;
}

/**
 * An outbound editorial link: label, a directional arrow and a hairline that
 * redraws on hover. Opens in a new tab; never styled as a social button.
 */
export function extLink(href: string, label: string, context: string, className = ''): HTMLAnchorElement {
  return h(
    'a',
    { class: `link-btn link-ext ${className}`.trim(), href, target: '_blank', rel: 'noopener noreferrer', 'data-cursor': label },
    h('span', { class: 'link-ext__arrow', 'aria-hidden': 'true' }, '↗'),
    h('span', { class: 'link-ext__label' }, label),
    h('span', { class: 'visually-hidden' }, `: ${context} (opens in a new tab)`),
  );
}

/** Tiny chapter annotation, e.g. "04 / 08 — WORK". */
export function chapterLabel(id: string, label: string, total: string): HTMLElement {
  return h(
    'p',
    { class: 'chapter-label meta', 'data-velocity': 'meta' },
    h('span', { class: 'chapter-label__no' }, `${chapterNo(id)} / ${total}`),
    h('span', { class: 'chapter-label__rule', 'aria-hidden': 'true' }),
    h('span', {}, label),
  );
}
