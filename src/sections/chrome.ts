import { brand, chapterCount, chapters } from '../data/portfolioData';
import { h, maskLines, shapeSvg } from '../lib/dom';
import { isSoundOn, setSound } from '../lib/sound';

function wordmark(): HTMLAnchorElement {
  return h(
    'a',
    { class: 'wordmark', href: '#top', 'aria-label': `${brand.name}, back to top`, 'data-cursor': 'Top' },
    h(
      'span',
      { class: 'wordmark__glyph', 'aria-hidden': 'true' },
      shapeSvg('square', 'blue'),
      shapeSvg('circle', 'yellow'),
      shapeSvg('triangle', 'red'),
    ),
    h('span', { class: 'wordmark__name' }, brand.name),
  );
}

export function renderHeader(): HTMLElement {
  const soundLabel = h('span', {}, isSoundOn() ? 'Sound on' : 'Sound off');
  const sound = h(
    'button',
    { class: 'sound-toggle meta', type: 'button', 'aria-pressed': String(isSoundOn()), 'data-cursor': 'Sound' },
    h('span', { class: 'sound-toggle__mark', 'aria-hidden': 'true' }),
    soundLabel,
  );
  sound.addEventListener('click', () => {
    const next = !isSoundOn();
    setSound(next);
    sound.setAttribute('aria-pressed', String(next));
    soundLabel.textContent = next ? 'Sound on' : 'Sound off';
  });

  return h(
    'header',
    { class: 'site-header' },
    wordmark(),
    h(
      'nav',
      { class: 'site-nav', 'aria-label': 'Primary' },
      h(
        'ul',
        {},
        ...chapters
          .filter((c) => c.nav)
          .map((c) =>
            h(
              'li',
              {},
              h(
                'a',
                { href: `#${c.id}`, 'data-nav': c.id, 'data-cursor': 'Go' },
                h('span', { class: 'site-nav__mark', 'aria-hidden': 'true' }),
                c.label,
              ),
            ),
          ),
      ),
    ),
    h(
      'div',
      { class: 'site-header__meta' },
      h(
        'p',
        { class: 'telemetry meta', 'aria-hidden': 'true' },
        h('span', {}, 'Scroll '),
        h('span', { class: 'telemetry__value', 'data-telemetry': 'scroll' }, '000'),
        h('span', {}, '%'),
        h('span', { class: 'telemetry__sep' }, '/'),
        h('span', {}, 'Sys '),
        h('span', { class: 'telemetry__value', 'data-telemetry': 'chapter' }, '01'),
        h('span', {}, `·${chapterCount}`),
      ),
      sound,
    ),
  );
}

export function renderFooter(): HTMLElement {
  // Socials first, email last; only links with a URL are shown.
  const links = [...brand.socials.filter((s) => s.url), { label: 'Email', url: `mailto:${brand.email}` }];
  return h(
    'footer',
    { class: 'site-footer', 'aria-labelledby': 'footer-title' },
    h(
      'div',
      { class: 'site-footer__inner container' },
      h(
        'div',
        { class: 'site-footer__statement', 'data-velocity': 'stretch' },
        maskLines('h2', ['Available for', 'select', 'projects.'], { id: 'footer-title', class: 'display' }),
      ),
      h(
        'ul',
        { class: 'site-footer__links' },
        ...links.map((l) =>
          h(
            'li',
            {},
            h(
              'a',
              { href: l.url, ...(l.url.startsWith('http') ? { rel: 'noopener noreferrer', target: '_blank' } : {}) },
              l.label,
            ),
          ),
        ),
      ),
      h(
        'div',
        { class: 'site-footer__end meta' },
        h('p', {}, `© ${new Date().getFullYear()} ${brand.name}`),
        h('a', { href: '#top', 'data-cursor': 'Top' }, 'Back to top'),
      ),
    ),
    h('div', { class: 'site-footer__orb', 'aria-hidden': 'true' }, shapeSvg('circle', 'yellow')),
  );
}
