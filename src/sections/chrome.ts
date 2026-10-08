import { brand, chapterCount, chapters, PROJECTS_PAGE } from '../data/portfolioData';
import { cube, h, maskLines, shapeSvg } from '../lib/dom';
import { isSoundOn, setSound } from '../lib/sound';
import { createMenu } from './menu';

export type Page = 'home' | 'projects';

function wordmark(page: Page): HTMLAnchorElement {
  return h(
    'a',
    {
      class: 'wordmark',
      href: page === 'home' ? '#top' : './',
      'aria-label': page === 'home' ? `${brand.name}, back to top` : `${brand.name}, home`,
      'data-cursor': page === 'home' ? 'Top' : 'Home',
    },
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

/**
 * Primary navigation: WORK / PROJECTS / TEAM / SYSTEM / CONTACT. Chapters are
 * in-page anchors on the homepage; Projects is its own page. From the Projects page
 * the chapters link back into the homepage.
 */
function navItems(page: Page): { href: string; id: string; label: string }[] {
  const chapter = (id: string) => {
    const c = chapters.find((x) => x.id === id)!;
    return { href: page === 'home' ? `#${c.id}` : `./#${c.id}`, id: c.id as string, label: c.label as string };
  };
  return [chapter('work'), { href: PROJECTS_PAGE, id: 'projects', label: 'Projects' }, chapter('people'), chapter('system'), chapter('contact')];
}

export function renderHeader(page: Page = 'home'): HTMLElement {
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

  const items = navItems(page);
  // Phones get a deliberate full-frame menu instead of five links squeezed into a row.
  const menu = createMenu(items.map((item) => ({ ...item, current: page === 'projects' && item.id === 'projects' })));
  document.body.append(menu.dialog);

  return h(
    'header',
    { class: 'site-header' },
    wordmark(page),
    h(
      'nav',
      { class: 'site-nav', 'aria-label': 'Primary' },
      h(
        'ul',
        {},
        ...items.map((item) =>
          h(
            'li',
            {},
            h(
              'a',
              {
                href: item.href,
                'data-nav': item.id,
                'data-cursor': 'Go',
                ...(page === 'projects' && item.id === 'projects' ? { 'aria-current': 'page' } : {}),
              },
              h('span', { class: 'site-nav__mark', 'aria-hidden': 'true' }),
              item.label,
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
        ...(page === 'home'
          ? [
              h('span', {}, 'Sys '),
              h('span', { class: 'telemetry__value', 'data-telemetry': 'chapter' }, '01'),
              h('span', {}, `·${chapterCount}`),
            ]
          : [h('span', {}, 'Archive')]),
      ),
      sound,
      menu.toggle,
    ),
  );
}

export function renderFooter(): HTMLElement {
  // Socials first, email last; only links with a URL are shown.
  const links = [...brand.socials.filter((s) => s.url), { label: 'Email', url: `mailto:${brand.email}` }];
  return h(
    'footer',
    { class: 'site-footer', 'aria-labelledby': 'footer-title', 'data-tone': 'yellow', 'data-from': 'yellow' },
    h('div', { class: 'plane', 'aria-hidden': 'true' }),
    h(
      'div',
      { class: 'site-footer__inner container' },
      h(
        'div',
        { class: 'site-footer__statement', 'data-velocity': 'stretch' },
        // The end card: the name, then the four disciplines.
        maskLines('h2', [brand.name], { id: 'footer-title', class: 'display site-footer__mark' }),
        h('p', { class: 'site-footer__disciplines meta' }, 'Software • Cloud • Web • Security'),
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
    // The last frame: the precision object from the opening, now black, comes to rest.
    h('div', { class: 'site-footer__orb', 'aria-hidden': 'true' }, cube('ink')),
  );
}
