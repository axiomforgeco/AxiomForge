import { team, type TeamMember } from '../data/portfolioData';
import { extLink, h, maskLines, shapeSvg } from '../lib/dom';
import { EASE, gsap, isReduced } from '../lib/motion';
import { lockScroll } from '../lib/scroll';

/**
 * Deep profile: a clean editorial panel that slides in over the page. It shows
 * only what is relevant to the person's AxiomForge role; it is not a resume.
 */
export function createProfile(): { dialog: HTMLDialogElement; open: (id: string) => void } {
  const content = h('div', { class: 'profile__content' });
  const close = h('button', { class: 'profile__close link-btn meta', type: 'button', 'data-cursor': 'Close' }, 'Close ✕');
  const panel = h('div', { class: 'profile__panel', 'data-lenis-prevent': true }, close, content);
  const dialog = h('dialog', { class: 'profile', 'aria-labelledby': 'profile-title' }, panel);
  let closing = false;

  const render = (m: TeamMember): void => {
    dialog.dataset.accent = m.accent;
    content.replaceChildren(
      h(
        'header',
        { class: 'profile__head' },
        h('p', { class: 'meta' }, `${m.index} / Profile`),
        maskLines('h2', [m.first, m.last], { id: 'profile-title', class: 'display profile__name' }),
        h('div', { class: 'profile__shape', 'aria-hidden': 'true' }, shapeSvg(m.shape, m.accent)),
        h('p', { class: 'profile__role meta' }, `${m.role} — ${m.focus}`),
        extLink(m.linkedin, 'LinkedIn', `${m.first} ${m.last} on LinkedIn`, 'profile__link'),
      ),
      h('div', { class: 'profile__summary' }, ...m.summary.map((p) => h('p', {}, p))),
      h(
        'section',
        { class: 'profile__row' },
        h('h3', { class: 'meta' }, 'Expertise'),
        h('ul', { class: 'profile__expertise' }, ...m.expertise.map((e) => h('li', {}, e))),
      ),
      ...m.blocks.map((b) =>
        h(
          'section',
          { class: `profile__row${b.title === 'Tools' || b.title === 'Projects' ? ' profile__row--inline' : ''}` },
          h('h3', { class: 'meta' }, b.title),
          h('ul', {}, ...b.items.map((i) => h('li', {}, i))),
        ),
      ),
    );
  };

  const open = (id: string): void => {
    const m = team.find((t) => t.id === id);
    if (!m) return;
    render(m);
    panel.scrollTop = 0;
    dialog.showModal();
    lockScroll(true);
    close.focus();
    if (isReduced()) {
      gsap.from(dialog, { autoAlpha: 0, duration: 0.25, ease: 'none' });
      return;
    }
    gsap
      .timeline()
      .fromTo(panel, { xPercent: 100 }, { xPercent: 0, duration: 0.7, ease: EASE.cinematic })
      .from(content.querySelectorAll('.profile__name .mask__line'), { yPercent: 110, stagger: 0.08, duration: 1, ease: EASE.out }, 0.35)
      .from(content.querySelector('.profile__shape'), { scale: 0.3, rotation: -90, duration: 0.6, ease: EASE.mechanical }, 0.45)
      .from(content.querySelectorAll('.profile__role, .profile__link, .profile__summary, .profile__row'), { autoAlpha: 0, y: 16, stagger: 0.05, duration: 0.5, ease: EASE.out }, 0.55);
  };

  const shut = (): void => {
    if (closing) return;
    const done = (): void => {
      closing = false;
      dialog.close();
      lockScroll(false);
      gsap.set(panel, { clearProps: 'all' });
    };
    if (isReduced()) return done();
    closing = true;
    gsap.to(panel, { xPercent: 100, duration: 0.5, ease: EASE.inOut, onComplete: done });
  };

  close.addEventListener('click', shut);
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    shut();
  });
  // A click on the dimmed page outside the panel closes it.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) shut();
  });

  return { dialog, open };
}
