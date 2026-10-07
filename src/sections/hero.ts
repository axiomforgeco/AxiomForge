import { brand, team } from '../data/portfolioData';
import { h, shapeSvg } from '../lib/dom';

export function renderHero(): HTMLElement {
  return h(
    'section',
    { id: 'top', class: 'hero', 'aria-labelledby': 'hero-title' },
    h(
      'div',
      { class: 'hero__grid container' },
      h(
        'div',
        { class: 'hero__copy' },
        h('p', { class: 'eyebrow' }, `${brand.name} — ${brand.descriptor} — 3 Engineers`),
        h(
          'h1',
          { id: 'hero-title', class: 'hero__title' },
          h('span', { class: 'hero__line', 'data-split': '' }, 'Architects'),
          h('span', { class: 'hero__line', 'data-split': '' }, 'of Code'),
          h('span', { class: 'hero__slash' }, '// Proof of Work'),
        ),
        h(
          'p',
          { class: 'hero__lede' },
          'Three engineers, three primitives. We design, build, test, secure and ship systems that hold up in production.',
        ),
        h(
          'ul',
          { class: 'hero__status', 'aria-label': 'Team status' },
          ...team.map((member) =>
            h(
              'li',
              {},
              shapeSvg(member.shape, member.accent, 'hero__status-shape'),
              h('span', { class: 'hero__status-role' }, member.domains[0] ?? member.role),
              h('span', { class: 'hero__status-state' }, 'ONLINE'),
            ),
          ),
        ),
        h(
          'div',
          { class: 'hero__actions' },
          h('a', { class: 'btn btn--ink', href: '#work' }, 'View the work'),
          h('a', { class: 'btn', href: '#contact' }, 'Initiate project'),
        ),
      ),
      h(
        'div',
        { class: 'hero__stage', 'aria-hidden': 'true' },
        h('span', { class: 'hero__bar' }),
        shapeSvg('circle', 'yellow', 'hero__shape hero__shape--circle'),
        shapeSvg('square', 'blue', 'hero__shape hero__shape--square'),
        shapeSvg('triangle', 'red', 'hero__shape hero__shape--triangle'),
        h('span', { class: 'hero__dot' }),
        h('span', { class: 'hero__coords' }, 'X:045 Y:090 R:180'),
      ),
    ),
    h(
      'a',
      { class: 'scroll-cue', href: '#team' },
      h('span', { class: 'scroll-cue__block', 'aria-hidden': 'true' }),
      'Scroll to explore ↓',
    ),
  );
}
