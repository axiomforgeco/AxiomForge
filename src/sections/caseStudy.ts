import { projectNo, team, type Project, type Shape } from '../data/portfolioData';
import { extLink, h, maskLines, shapeSvg } from '../lib/dom';
import { EASE, gsap, isReduced } from '../lib/motion';
import { lockScroll } from '../lib/scroll';

/**
 * "Project mode": a full-screen <dialog> (native focus trap, Esc, top layer).
 * Opening expands the project's colour field out of its geometry, then the
 * title and the mini case study arrive. Closing runs the transition backwards.
 * `list` is the set it belongs to (the featured three, or the whole archive):
 * numbering and "next project" follow it.
 */
export function createCaseStudy(list: readonly Project[]): {
  dialog: HTMLDialogElement;
  open: (id: string, origin: Element) => void;
} {
  // Two layers: the signal-coloured shape, and the neutral field that grows out of it.
  const signal = h('div', { class: 'case__signal', 'aria-hidden': 'true' });
  const wipe = h('div', { class: 'case__wipe', 'aria-hidden': 'true' });
  const content = h('div', { class: 'case__content' });
  const closeBtn = h('button', { class: 'case__close link-btn meta', type: 'button', 'data-cursor': 'Close' }, 'Close ✕');
  // The case scrolls natively inside itself; the page behind it is held still.
  const scroller = h('div', { class: 'case__scroll', 'data-lenis-prevent': true }, closeBtn, content);
  const dialog = h('dialog', { class: 'case', 'aria-labelledby': 'case-title' }, signal, wipe, scroller);

  // Clip-paths for the expanding shape: `small` sits exactly on the poster's geometry.
  let clip = { small: 'inset(50% 50% 50% 50%)', mid: 'inset(50% 50% 50% 50%)', large: 'inset(0px 0px 0px 0px)' };
  let accent = 'var(--ink)';
  let closing = false;

  const render = (p: Project): void => {
    const i = list.indexOf(p);
    const next = list[(i + 1) % list.length]!;
    // The case opens into the opposite field, so entering it is visibly a change of environment.
    dialog.dataset.theme = p.theme === 'paper' ? 'ink' : 'paper';

    // Only fields with real data are shown: no empty labels.
    const facts = [
      p.client ? `Client / ${p.client}` : '',
      `${p.category[0]} / ${p.category[1]}`,
      p.year ?? '',
      p.status,
    ].filter(Boolean);
    const rows: [string, HTMLElement][] = [
      ['What it was', h('p', {}, p.what)],
      ['The problem', h('p', {}, p.problem)],
      ['How it is used', h('p', {}, p.usage)],
    ];
    if (p.built.length) rows.push(['What we built', h('ul', { class: 'case__stack' }, ...p.built.map((b) => h('li', {}, b)))]);
    if (p.tech.length) rows.push(['Technology', h('ul', { class: 'case__stack case__tech' }, ...p.tech.map((x) => h('li', {}, x)))]);
    if (p.flow) rows.push(['Architecture', h('p', { class: 'case__flow' }, p.flow.join('  →  '))]);
    if (p.outcome) rows.push(['Outcome', h('p', {}, p.outcome)]);
    if (p.contributors.length) {
      rows.push([
        'Team',
        h(
          'ul',
          { class: 'case__team' },
          ...p.contributors.map((c) => {
            const m = team.find((t) => t.id === c.who)!;
            return h('li', {}, h('span', { class: 'case__team-name' }, `${m.first} ${m.last}`), h('span', { class: 'meta' }, c.what));
          }),
        ),
      ]);
    }
    // A real link, or an honest label for systems that are not public.
    rows.push(p.url ? ['Live project', extLink(p.url, 'Visit project', p.title, 'case__visit')] : ['Availability', h('p', {}, p.status)]);

    const nextBtn = h(
      'button',
      { class: 'case__next', type: 'button', 'data-cursor': 'Next' },
      h('span', { class: 'meta' }, 'Next project'),
      h('span', { class: 'case__next-name display' }, next.title),
    );
    nextBtn.addEventListener('click', () => {
      render(next);
      scroller.scrollTop = 0;
      if (!isReduced()) animateIn(false);
      closeBtn.focus();
    });

    content.replaceChildren(
      h(
        'header',
        { class: 'case__hero' },
        h('p', { class: 'meta case__kicker' }, `Project ${projectNo(list, p)} / ${String(list.length).padStart(2, '0')}`),
        maskLines('h2', p.lines, { id: 'case-title', class: 'display case__title' }),
        h('p', { class: 'case__cat meta' }, facts.join('  ·  ')),
        h('div', { class: 'case__geo', 'aria-hidden': 'true' }, shapeSvg(p.shape, p.accent)),
        h('p', { class: 'case__summary' }, p.summary),
      ),
      h(
        'div',
        { class: 'case__rows' },
        ...rows.map(([label, body], n) =>
          h(
            'section',
            { class: 'case__row' },
            h('h3', { class: 'meta' }, h('span', {}, String(n + 1).padStart(2, '0')), label),
            body,
          ),
        ),
      ),
      nextBtn,
    );
  };

  const animateIn = (withWipe: boolean): void => {
    const tl = gsap.timeline();
    if (withWipe) {
      // PROJECT → EXPAND: the poster's own shape grows from where it sits, in its signal colour…
      tl.set(scroller, { autoAlpha: 0 })
        .set(signal, { backgroundColor: accent, autoAlpha: 1 })
        .fromTo(signal, { clipPath: clip.small }, { clipPath: clip.mid, duration: 0.55, ease: EASE.out })
        // → TRANSFORM: …then the neutral field grows out of that shape and takes the whole frame.
        // The signal colour is only ever seen as the shape, never as a full-screen flood.
        .fromTo(wipe, { clipPath: clip.mid }, { clipPath: clip.large, duration: 0.8, ease: EASE.cinematic }, 0.42)
        .set(signal, { autoAlpha: 0 })
        .set(scroller, { autoAlpha: 1 }, 0.95);
    }
    // → CASE STUDY: title first, then the editorial rows.
    tl.from(content.querySelectorAll('.case__title .mask__line'), { yPercent: 110, duration: 1.1, ease: EASE.out }, withWipe ? 0.95 : 0)
      .from(content.querySelector('.case__geo'), { scale: 0.2, rotation: -90, duration: 0.6, ease: EASE.mechanical }, '<0.15')
      .from(
        content.querySelectorAll('.case__kicker, .case__cat, .case__summary, .case__row, .case__next'),
        { autoAlpha: 0, y: 24, stagger: 0.06, duration: 0.6, ease: EASE.out },
        '<0.25',
      )
      .from(closeBtn, { autoAlpha: 0, duration: 0.3 }, '<');
  };

  /** Clip-paths for a shape on the poster geometry: exact, grown (×2.4) and covering the viewport. */
  const shapeClips = (shape: Shape, r: DOMRect): { small: string; mid: string; large: string } => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const px = (n: number): string => `${n.toFixed(1)}px`;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const cover = (Math.hypot(vw, vh) * 2) / Math.max(1, Math.min(r.width, r.height));
    if (shape === 'circle') {
      const at = `at ${px(cx)} ${px(cy)}`;
      const c = (k: number): string => `circle(${px((r.width / 2) * k)} ${at})`;
      return { small: c(1), mid: c(2.4), large: c(cover) };
    }
    if (shape === 'square') {
      const sq = (k: number): string => {
        const w = (r.width * k) / 2;
        const hh = (r.height * k) / 2;
        const v = (n: number): string => px(Math.max(0, n));
        return `inset(${v(cy - hh)} ${v(vw - cx - w)} ${v(vh - cy - hh)} ${v(cx - w)})`;
      };
      return { small: sq(1), mid: sq(2.4), large: 'inset(0px 0px 0px 0px)' };
    }
    // Triangle: scale about its centroid.
    const g = { x: cx, y: r.top + (r.height * 2) / 3 };
    const pts = [
      { x: cx, y: r.top },
      { x: r.right, y: r.bottom },
      { x: r.left, y: r.bottom },
    ];
    const poly = (k: number): string =>
      `polygon(${pts.map((p) => `${px(g.x + (p.x - g.x) * k)} ${px(g.y + (p.y - g.y) * k)}`).join(', ')})`;
    return { small: poly(1), mid: poly(2.4), large: poly(cover * 3) };
  };

  const open = (id: string, from: Element): void => {
    const p = list.find((x) => x.id === id);
    if (!p) return;
    const r = from.getBoundingClientRect();
    const onScreen = r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
    const rect = onScreen ? r : new DOMRect(window.innerWidth / 2 - 50, window.innerHeight / 2 - 50, 100, 100);
    clip = shapeClips(p.shape, rect);
    accent = getComputedStyle(document.documentElement).getPropertyValue(`--${p.accent}`).trim();
    render(p);
    scroller.scrollTop = 0;
    dialog.showModal();
    lockScroll(true);
    closeBtn.focus();
    if (isReduced()) gsap.from(dialog, { autoAlpha: 0, duration: 0.25, ease: 'none' });
    else animateIn(true);
  };

  const close = (): void => {
    if (closing) return;
    if (isReduced()) {
      dialog.close();
      lockScroll(false);
      return;
    }
    closing = true;
    gsap
      .timeline({
        onComplete: () => {
          closing = false;
          dialog.close();
          lockScroll(false);
          gsap.set([wipe, scroller, signal], { clearProps: 'all' });
        },
      })
      .to(scroller, { autoAlpha: 0, duration: 0.25, ease: 'none' })
      .set(signal, { backgroundColor: accent, clipPath: clip.mid, autoAlpha: 1 })
      .to(wipe, { clipPath: clip.mid, duration: 0.5, ease: EASE.cinematic }, '<0.1')
      .set(wipe, { autoAlpha: 0 })
      .to(signal, { clipPath: clip.small, duration: 0.3, ease: EASE.inOut });
  };

  closeBtn.addEventListener('click', close);
  // Esc fires "cancel"; run the closing transition instead of vanishing instantly.
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });

  return { dialog, open };
}
