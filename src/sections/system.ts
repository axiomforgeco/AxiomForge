import { chapterCount, processStages } from '../data/portfolioData';
import { chapterLabel, h, maskLines } from '../lib/dom';

/** The process as one machine line: DISCOVER — BUILD — BREAK — DEFEND. */
export function renderSystem(): HTMLElement {
  const stages = processStages.map((st, i) =>
    h(
      'li',
      { class: `stage stage--${st.accent}`, 'data-stage': i },
      h('span', { class: 'stage__node', 'aria-hidden': 'true' }),
      h('h3', { class: 'stage__word' }, st.word),
      h('p', { class: 'stage__text' }, st.text),
      h(
        'p',
        { class: 'stage__io meta' },
        h('span', {}, `In / ${st.input}`),
        h('span', {}, `Out / ${st.output}`),
      ),
    ),
  );

  // The oversized word is decoration for sighted users; the list above carries the content.
  const display = h(
    'div',
    { class: 'system__display', 'aria-hidden': 'true' },
    ...processStages.map((st, i) =>
      maskLines('p', [st.word], { class: 'system__word display', 'data-word': i }),
    ),
  );

  return h(
    'section',
    { id: 'system', class: 'section system', 'aria-labelledby': 'system-title' },
    h(
      'div',
      { class: 'container system__inner' },
      h(
        'header',
        { class: 'system__head' },
        chapterLabel('system', 'Process', chapterCount),
        h('h2', { id: 'system-title', class: 'visually-hidden' }, 'How a project moves through us'),
      ),
      display,
      h('div', { class: 'system__morph', 'aria-hidden': 'true' }),
      h(
        'div',
        { class: 'system__track' },
        h('div', { class: 'system__line', 'aria-hidden': 'true' }, h('span', { class: 'system__fill' })),
        h('span', { class: 'system__marker', 'aria-hidden': 'true' }),
        h('ol', { class: 'system__stages' }, ...stages),
      ),
    ),
  );
}
