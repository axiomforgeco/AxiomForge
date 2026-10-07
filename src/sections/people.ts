import { chapterCount, team } from '../data/portfolioData';
import { chapterLabel, h, maskLines, shapeSvg } from '../lib/dom';

/**
 * Each teammate is a typographic composition, not a profile card. In full motion
 * mode the three compositions share one stage and transform into one another;
 * otherwise they simply stack.
 */
export function renderPeople(): HTMLElement {
  const people = team.map((m, i) =>
    h(
      'article',
      { class: `person person--${m.accent}`, 'data-person': i, 'aria-labelledby': `person-${m.id}` },
      h('p', { class: 'person__no numeral', 'aria-hidden': 'true' }, m.index),
      maskLines('h3', m.lines, { id: `person-${m.id}`, class: 'person__lines display' }),
      h(
        'p',
        { class: 'person__role meta' },
        `${m.letter} — ${m.role}`,
        m.name ? h('span', { class: 'person__name' }, ` / ${m.name}`) : null,
      ),
      h('div', { class: 'person__shape', 'aria-hidden': 'true' }, shapeSvg(m.shape, m.accent)),
      h('span', { class: 'person__rule', 'aria-hidden': 'true' }),
      h('p', { class: 'person__statement' }, m.statement),
      h('ul', { class: 'person__disc meta', 'aria-label': 'Disciplines' }, ...m.disciplines.map((d) => h('li', {}, d))),
    ),
  );

  const index = h(
    'ol',
    { class: 'people__index', 'aria-label': 'Jump to teammate' },
    ...team.map((m, i) =>
      h(
        'li',
        {},
        h(
          'button',
          { type: 'button', class: 'meta', 'data-goto': i, 'aria-label': `${m.role}`, 'data-cursor': 'Go' },
          m.index,
        ),
      ),
    ),
  );

  return h(
    'section',
    { id: 'people', class: 'section people', 'aria-labelledby': 'people-title' },
    h(
      'div',
      { class: 'container people__inner' },
      h(
        'header',
        { class: 'people__head' },
        chapterLabel('people', 'People', chapterCount),
        h('h2', { id: 'people-title', class: 'visually-hidden' }, 'People'),
      ),
      h(
        'div',
        { class: 'people__stage' },
        h('div', { class: 'people__morph', 'aria-hidden': 'true' }),
        index,
        ...people,
      ),
    ),
  );
}
