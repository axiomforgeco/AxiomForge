import { chapterCount, philosophy } from '../data/portfolioData';
import { chapterLabel, h, shapeSvg } from '../lib/dom';

export function renderPhilosophy(): HTMLElement {
  // Each word is its own span so scroll can reveal the statement word by word.
  const statement = h('p', { class: 'philosophy__statement', id: 'philosophy-title' });
  philosophy.statement.split(' ').forEach((word, i, all) => {
    statement.append(h('span', { class: 'word' }, word));
    if (i < all.length - 1) statement.append(' ');
  });

  return h(
    'section',
    { id: 'philosophy', class: 'section philosophy', 'aria-labelledby': 'philosophy-title' },
    h(
      'div',
      { class: 'container' },
      chapterLabel('philosophy', 'Philosophy', chapterCount),
      statement,
      h(
        'ol',
        { class: 'principles' },
        ...philosophy.principles.map((p) =>
          h(
            'li',
            { class: 'principle' },
            h(
              'div',
              { class: 'principle__head' },
              h('span', { class: 'meta' }, p.no),
              shapeSvg(p.shape, 'ink', 'principle__shape'),
            ),
            h('h3', { class: 'principle__title' }, p.title),
            h('p', { class: 'principle__text' }, p.text),
          ),
        ),
      ),
    ),
  );
}
