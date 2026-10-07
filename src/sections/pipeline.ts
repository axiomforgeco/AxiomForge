import { pipeline } from '../data/portfolioData';
import { h, s, sectionHead } from '../lib/dom';

// Right-angled route: stations sit at these fractions of the path length.
export const PIPE_PATH = 'M 40 70 H 330 V 290 H 870 V 70 H 1160';
export const STATION_AT = [0.08, 0.36, 0.64, 0.92] as const;

export function renderPipeline(): HTMLElement {
  const svg = s(
    'svg',
    { class: 'pipeline__svg', viewBox: '0 0 1200 360', 'aria-hidden': 'true', focusable: 'false' },
    s('path', { class: 'pipeline__track', d: PIPE_PATH }),
    s('path', { class: 'pipeline__path', d: PIPE_PATH }),
    s('g', { class: 'pipeline__nodes' }),
    s('circle', { class: 'pipeline__marker', r: 22, cx: 40, cy: 70 }),
  );

  const stations = pipeline.map((station, i) =>
    h(
      'li',
      { class: `station station--${station.accent}`, 'data-station': i },
      h('span', { class: 'station__code' }, station.code),
      h('h3', { class: 'station__title' }, station.title),
      h('p', { class: 'station__detail' }, station.detail),
    ),
  );

  return h(
    'section',
    { id: 'process', class: 'section pipeline', 'aria-labelledby': 'process-title' },
    h(
      'div',
      { class: 'container pipeline__inner' },
      sectionHead(
        '03',
        'Process',
        'How We Build',
        'One production line from spec to monitored release. The marker shows where a project stands.',
      ),
      h('div', { class: 'pipeline__stage' }, svg),
      h('ol', { class: 'pipeline__stations' }, ...stations),
    ),
  );
}

/** Places the station nodes on the path. Needs the SVG in the DOM to measure it. */
export function placeStationNodes(root: HTMLElement): void {
  const path = root.querySelector<SVGPathElement>('.pipeline__path');
  const group = root.querySelector<SVGGElement>('.pipeline__nodes');
  if (!path || !group) return;
  const length = path.getTotalLength();
  group.replaceChildren(
    ...STATION_AT.map((at, i) => {
      const p = path.getPointAtLength(length * at);
      return s('rect', {
        class: `pipeline__node pipeline__node--${pipeline[i]?.accent ?? 'ink'}`,
        x: p.x - 20,
        y: p.y - 20,
        width: 40,
        height: 40,
        'data-node': i,
      });
    }),
  );
}
