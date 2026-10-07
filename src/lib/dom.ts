import type { Accent, Shape } from '../data/portfolioData';

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

/** The shape colour that reads on top of an accent fill. */
export const onFill = (accent: Accent): ShapeColor => (accent === 'yellow' ? 'ink' : 'paper');

/** Decorative geometric primitive. Hidden from assistive tech. */
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

export function $<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

export function $$<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/** Numbered section header with a 90° rotated label, shared by every scene. */
export function sectionHead(index: string, label: string, title: string, intro?: string): HTMLElement {
  return h(
    'header',
    { class: 'section-head' },
    h('p', { class: 'section-head__label', 'aria-hidden': 'true' }, `${index} / ${label}`),
    h(
      'div',
      { class: 'section-head__main' },
      h('h2', { class: 'section-head__title', id: `${label.toLowerCase()}-title` }, title),
      intro ? h('p', { class: 'section-head__intro' }, intro) : null,
    ),
  );
}
