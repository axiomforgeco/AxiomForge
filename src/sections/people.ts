import { brand, chapterCount, team } from '../data/portfolioData';
import { chapterLabel, extLink, h, shapeSvg } from '../lib/dom';
import { createProfile } from './profile';

/**
 * Three subsystems of one company. Each person is a large identity (name, role,
 * one sentence, a geometric symbol); in full motion mode one becomes dominant at a
 * time, then all three converge on a single beam and AXIOMFORGE is forged from them.
 */
export function renderPeople(): HTMLElement {
  const profile = createProfile();

  const idents = team.map((m, i) =>
    h(
      'article',
      { class: `ident ident--${m.shape}`, 'data-person': i, 'data-id': m.id, 'aria-labelledby': `ident-${m.id}` },
      h(
        'div',
        { class: 'ident__geo', 'aria-hidden': 'true', 'data-cursor-shape': m.shape },
        h('div', { class: 'ident__shape' }, shapeSvg(m.shape, m.accent)),
        // Each symbol has its own way of growing when its person is in focus.
        h('span', { class: 'ident__extra' }, ...(m.shape === 'square' ? [h('i'), h('i'), h('i')] : [])),
      ),
      h('p', { class: 'ident__no meta' }, m.index),
      h(
        'h3',
        { class: 'ident__name', id: `ident-${m.id}` },
        h('span', {}, m.first),
        ' ',
        h('span', {}, m.last),
      ),
      h('p', { class: 'ident__role meta' }, h('span', {}, m.role), h('span', {}, m.focus)),
      h('p', { class: 'ident__line' }, m.line),
      h(
        'div',
        { class: 'ident__actions' },
        h(
          'button',
          { class: 'ident__open link-btn', type: 'button', 'data-profile': m.id, 'data-cursor': 'Profile' },
          'Profile',
          h('span', { class: 'visually-hidden' }, `: ${m.first} ${m.last}`),
          h('span', { class: 'link-btn__arrow', 'aria-hidden': 'true' }, '→'),
        ),
        extLink(m.linkedin, 'LinkedIn', `${m.first} ${m.last} on LinkedIn`),
      ),
    ),
  );

  const index = h(
    'ol',
    { class: 'people__index', 'aria-label': 'Focus a person' },
    ...team.map((m, i) =>
      h('li', {}, h('button', { type: 'button', class: 'meta', 'data-goto': i, 'data-cursor': 'Focus' }, `${m.index} ${m.first}`)),
    ),
  );

  // The bridge into the work: three systems on one beam, and the company forged from them.
  const forge = h(
    'div',
    { class: 'people__forge', 'aria-hidden': 'true' },
    h('span', { class: 'people__beam' }),
    h('p', { class: 'people__mark' }, ...Array.from(brand.name).map((c) => h('span', {}, c))),
    h('p', { class: 'people__equation meta' }, 'Frontend + Software + Cloud + Security'),
  );

  const section = h(
    'section',
    { id: 'people', class: 'section people', 'aria-labelledby': 'people-title', 'data-tone': 'dark', 'data-from': 'ivory', 'data-wipe': 'circle' },
    h('div', { class: 'plane', 'aria-hidden': 'true' }),
    h(
      'div',
      { class: 'container people__inner' },
      h(
        'header',
        { class: 'people__head' },
        chapterLabel('people', 'People', chapterCount),
        h('h2', { id: 'people-title', class: 'people__title meta' }, 'Three disciplines / One system'),
        index,
      ),
      h('div', { class: 'people__stage' }, ...idents, forge),
      h('p', { class: 'people__summary' }, brand.narrative),
    ),
  );

  // The panel lives on <body> so it never inherits a section's colour tone.
  document.body.append(profile.dialog);
  section.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLElement>('[data-profile]');
    if (btn?.dataset.profile) profile.open(btn.dataset.profile);
  });
  return section;
}
