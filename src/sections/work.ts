import { chapterCount, featuredProjects, projectNo, PROJECTS_PAGE, workProjects } from '../data/portfolioData';
import { chapterLabel, extLink, h, maskLines, shapeSvg } from '../lib/dom';
import { createCaseStudy } from './caseStudy';

/** Featured work: an editorial title, one poster per featured project, then the way into the archive. */
export function renderWork(): HTMLElement {
  const list = featuredProjects;
  const caseStudy = createCaseStudy(list);
  const total = String(list.length).padStart(2, '0');

  const panels = list.map((p) =>
    h(
      'article',
      { class: `panel panel--${p.theme}`, 'data-project': p.id, 'aria-labelledby': `panel-${p.id}` },
      // System tier: the number is an annotation; the name owns the frame.
      h('p', { class: 'panel__no meta', 'aria-hidden': 'true' }, `${projectNo(list, p)} / ${total}`),
      h(
        'div',
        { class: 'panel__meta' },
        h(
          'div',
          { 'data-velocity': 'meta' },
          h('p', { class: 'panel__cat' }, h('span', {}, p.category[0]), h('span', {}, p.category[1])),
          h('p', { class: 'panel__summary' }, p.summary),
          h(
            'div',
            { class: 'panel__actions' },
            h(
              'button',
              { class: 'panel__open link-btn', type: 'button', 'data-open': p.id, 'data-cursor': 'Open' },
              'Open project',
              h('span', { class: 'visually-hidden' }, `: ${p.title}`),
              h('span', { class: 'link-btn__arrow', 'aria-hidden': 'true' }, '→'),
            ),
            p.url ? extLink(p.url, 'Visit project', p.title) : null,
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
        h(
          'h3',
          { class: 'panel__title display', id: `panel-${p.id}` },
          // One block per line; the space keeps the accessible name "Mughlai Dastarkhwan".
          ...p.lines.flatMap((line, i) => [i ? ' ' : null, h('span', { class: 'panel__line' }, line)]),
        ),
      ),
    ),
  );

  const stage = h('div', { class: 'work__stage' }, ...panels);
  stage.addEventListener('click', (event) => {
    const btn = (event.target as Element).closest<HTMLElement>('[data-open]');
    if (!btn) return;
    const geo = btn.closest('.panel')?.querySelector('.panel__geo svg') ?? btn;
    caseStudy.open(btn.dataset.open ?? '', geo);
  });

  // Project mode lives on <body> so it never inherits a section's colour tone.
  document.body.append(caseStudy.dialog);
  return h(
    'section',
    { id: 'work', class: 'work', 'aria-labelledby': 'work-title', 'data-tone': 'dark', 'data-from': 'dark' },
    h('div', { class: 'plane', 'aria-hidden': 'true' }),
    h(
      'header',
      { class: 'section work__intro container' },
      chapterLabel('work', 'Featured work', chapterCount),
      maskLines('h2', ['Featured', 'work'], { id: 'work-title', class: 'display section-title' }),
      h('p', { class: 'meta work__count' }, `${total} featured / ${String(workProjects.length).padStart(2, '0')} in the archive`),
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
    // The way out of the featured three and into everything else.
    h(
      'div',
      { class: 'work__all container' },
      h('p', { class: 'meta' }, `Archive / ${String(workProjects.length).padStart(2, '0')} projects`),
      h(
        'a',
        { class: 'work__all-link display', href: PROJECTS_PAGE, 'data-cursor': 'Archive' },
        h('span', { class: 'work__all-label' }, 'View all projects'),
        h('span', { class: 'work__all-arrow', 'aria-hidden': 'true' }, '→'),
      ),
    ),
  );
}
