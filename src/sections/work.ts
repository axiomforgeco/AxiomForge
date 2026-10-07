import { chapterCount, projects } from '../data/portfolioData';
import { chapterLabel, h, maskLines, shapeSvg } from '../lib/dom';
import { createCaseStudy } from './caseStudy';

/** Selected work: an editorial title, then one poster per project. */
export function renderWork(): HTMLElement {
  const caseStudy = createCaseStudy();
  const total = String(projects.length).padStart(2, '0');

  const panels = projects.map((p) =>
    h(
      'article',
      { class: `panel panel--${p.theme}`, 'data-project': p.id, 'aria-labelledby': `panel-${p.id}` },
      h('p', { class: 'panel__no numeral', 'aria-hidden': 'true' }, p.index),
      h(
        'div',
        { class: 'panel__meta' },
        h(
          'div',
          { 'data-velocity': 'meta' },
          h('p', { class: 'panel__cat' }, h('span', {}, p.category[0]), h('span', {}, p.category[1])),
          h('p', { class: 'panel__summary' }, p.summary),
          h(
            'button',
            { class: 'panel__open link-btn', type: 'button', 'data-open': p.id, 'data-cursor': 'Open' },
            'Case study',
            h('span', { class: 'visually-hidden' }, `: ${p.name}`),
            h('span', { class: 'link-btn__arrow', 'aria-hidden': 'true' }, '→'),
          ),
        ),
      ),
      h(
        'div',
        { class: 'panel__geo', 'aria-hidden': 'true', 'data-cursor-shape': p.shape },
        h('div', { 'data-velocity': 'drift' }, h('div', { class: 'panel__geo-inner' }, shapeSvg(p.shape, p.accent))),
      ),
      h(
        'div',
        { class: 'panel__title-wrap', 'data-velocity': 'skew' },
        h('h3', { class: 'panel__title display', id: `panel-${p.id}` }, p.name),
      ),
      p.year ? h('p', { class: 'panel__year meta' }, p.year) : null,
    ),
  );

  const stage = h('div', { class: 'work__stage' }, ...panels);
  stage.addEventListener('click', (event) => {
    const btn = (event.target as Element).closest<HTMLElement>('[data-open]');
    if (!btn) return;
    const geo = btn.closest('.panel')?.querySelector('.panel__geo svg') ?? btn;
    caseStudy.open(btn.dataset.open ?? '', geo);
  });

  return h(
    'section',
    { id: 'work', class: 'work', 'aria-labelledby': 'work-title' },
    h(
      'header',
      { class: 'section work__intro container' },
      chapterLabel('work', 'Selected work', chapterCount),
      maskLines('h2', ['Selected', 'work'], { id: 'work-title', class: 'display section-title' }),
      h('p', { class: 'meta work__count' }, `${total} projects`),
    ),
    h(
      'div',
      { class: 'work__gallery' },
      h(
        'p',
        { class: 'work__progress meta', 'aria-hidden': 'true' },
        h('span', { 'data-work-index': '' }, '01'),
        h('span', { class: 'work__progress-bar' }, h('span')),
        h('span', {}, total),
      ),
      stage,
    ),
    caseStudy.dialog,
  );
}
