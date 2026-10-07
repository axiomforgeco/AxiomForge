import { brand, navLinks } from '../data/portfolioData';
import { h, shapeSvg } from '../lib/dom';
import { isSoundOn, setSound } from '../lib/sound';

function utcNow(): string {
  return new Date().toISOString().slice(11, 19);
}

export function renderHeader(): HTMLElement {
  const clock = h('time', { class: 'header-meta__clock' }, utcNow());
  const tickClock = (): void => {
    const now = new Date();
    clock.textContent = utcNow();
    clock.dateTime = now.toISOString();
  };
  tickClock();
  window.setInterval(tickClock, 1000);

  const soundBtn = h(
    'button',
    { class: 'sound-toggle', type: 'button', 'aria-pressed': String(isSoundOn()) },
    h('span', { class: 'sound-toggle__bars', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
    h('span', { class: 'sound-toggle__label' }, isSoundOn() ? 'SOUND ON' : 'SOUND OFF'),
  );
  soundBtn.addEventListener('click', () => {
    const next = !isSoundOn();
    setSound(next);
    soundBtn.setAttribute('aria-pressed', String(next));
    soundBtn.querySelector('.sound-toggle__label')!.textContent = next ? 'SOUND ON' : 'SOUND OFF';
  });

  return h(
    'header',
    { class: 'site-header' },
    h(
      'div',
      { class: 'site-header__inner' },
      h(
        'a',
        { class: 'brand', href: '#top', 'aria-label': `${brand.name}, back to top` },
        h(
          'span',
          { class: 'brand__mark' },
          shapeSvg('square', 'blue'),
          shapeSvg('circle', 'yellow'),
          shapeSvg('triangle', 'red'),
        ),
        h('span', { class: 'brand__name' }, brand.name),
      ),
      h(
        'nav',
        { class: 'site-nav', 'aria-label': 'Scenes' },
        h(
          'ul',
          {},
          ...navLinks.map((link, i) =>
            h(
              'li',
              {},
              h(
                'a',
                { href: `#${link.id}`, 'data-nav': link.id },
                h('span', { class: 'site-nav__num', 'aria-hidden': 'true' }, `0${i + 1}`),
                link.label,
              ),
            ),
          ),
        ),
      ),
      h(
        'div',
        { class: 'header-meta' },
        h(
          'p',
          { class: 'header-meta__time' },
          h('span', { class: 'header-meta__key' }, 'UTC'),
          clock,
        ),
        h(
          'p',
          { class: 'status-badge' },
          h('span', { class: 'status-badge__dot', 'aria-hidden': 'true' }),
          'SYSTEM: OPERATIONAL',
        ),
        soundBtn,
      ),
    ),
    h('div', { class: 'scroll-progress', 'aria-hidden': 'true' }, h('span')),
  );
}
