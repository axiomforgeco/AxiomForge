import { brand, navLinks, team } from '../data/portfolioData';
import { h, shapeSvg } from '../lib/dom';

export function renderFooter(): HTMLElement {
  const toTop = h('a', { class: 'btn btn--paper back-to-top', href: '#top' }, '↑ Back to top');

  return h(
    'footer',
    { class: 'site-footer' },
    h(
      'div',
      { class: 'container site-footer__grid' },
      h(
        'ul',
        { class: 'manifesto', 'aria-label': 'Manifesto' },
        ...brand.manifesto.map((line, i) =>
          h('li', { class: `manifesto__line manifesto__line--${i}` }, line),
        ),
      ),
      h(
        'div',
        { class: 'site-footer__col' },
        h('p', { class: 'mono-label' }, 'The collective'),
        h(
          'ul',
          { class: 'footer-team' },
          ...team.map((m) =>
            h(
              'li',
              {},
              shapeSvg(m.shape, m.accent, 'footer-team__shape'),
              h('span', {}, m.name),
              h('span', { class: 'footer-team__role' }, m.role),
            ),
          ),
        ),
      ),
      h(
        'nav',
        { class: 'site-footer__col', 'aria-label': 'Footer' },
        h('p', { class: 'mono-label' }, 'Scenes'),
        h(
          'ul',
          { class: 'footer-links' },
          ...navLinks.map((l) => h('li', {}, h('a', { href: `#${l.id}` }, l.label))),
        ),
      ),
      h(
        'div',
        { class: 'site-footer__base' },
        h('p', {}, `© ${new Date().getFullYear()} ${brand.name} — ${brand.descriptor}`),
        h('p', { class: 'mono-label' }, 'All systems nominal'),
        toTop,
      ),
    ),
  );
}
