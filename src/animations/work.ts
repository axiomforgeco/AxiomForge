import { $, $$, cube, h } from '../lib/dom';
import { createScene, DUR, EASE, gsap, pageTop, scrollBox } from '../lib/motion';
import { scrollToY } from '../lib/scroll';

const ENTER = 0.9;
const HOLD = 1;
const CHANGE = 1.4;
const SIGNATURE = 2.1;

type Parts = {
  no: HTMLElement;
  meta: HTMLElement;
  geo: HTMLElement;
  title: HTMLElement;
  meta2: HTMLElement[];
};

/** Transform origin inside the first letter's left stroke, so the zoom dives into a letterform. */
function letterOrigin(title: HTMLElement): string {
  const text = document.createTreeWalker(title, NodeFilter.SHOW_TEXT).nextNode();
  const t = title.getBoundingClientRect();
  if (!text || !t.width) return '2% 30%';
  const range = document.createRange();
  range.setStart(text, 0);
  range.setEnd(text, 1);
  const c = range.getBoundingClientRect();
  const x = ((c.left - t.left + c.width * 0.14) / t.width) * 100;
  const y = ((c.top - t.top + c.height * 0.55) / t.height) * 100;
  return `${x.toFixed(2)}% ${y.toFixed(2)}%`;
}

/**
 * Featured work: one pinned stage, three projects, three worlds, one motion
 * language, and a different movement personality for each change.
 *
 *   01 MUGHLAI DASTARKHWAN     enter → lock → hold → typography expansion (dive into the M)
 *   02 ALL INDIA JAMIAT RAYEEN signature entrance: giant letters, the circle travels
 *                              behind them, the type resolves → hold → the pass-through:
 *                              the name breaks apart, a red object turns in the gap, the
 *                              camera flies through it
 *   03 CCS INFRATECH           opens from inside the object; spatial displacement: every
 *                              element arrives from its own direction
 *
 * No snapping: the page is never pulled away from where the visitor put it.
 */
export function animateWork(root: HTMLElement): void {
  const gallery = $('.work__gallery', root);
  const panels = $$('.panel', root);
  const indexEl = $('[data-work-index]', root);
  const bar = $('.work__progress-bar span', root);
  const progress = $('.work__progress', root);
  const css = getComputedStyle(document.documentElement);
  const token = (name: string): string => css.getPropertyValue(`--${name}`).trim();
  const isDark = (p: HTMLElement): boolean => p.matches('.panel--ink, .panel--charcoal, .panel--red');
  const FIELD: Record<string, string> = { ink: 'c-black', charcoal: 'charcoal', red: 'c-red', yellow: 'c-yellow', paper: 'c-ivory' };
  const bg = (p: HTMLElement): string => {
    const theme = Object.keys(FIELD).find((k) => p.classList.contains(`panel--${k}`)) ?? 'paper';
    return token(FIELD[theme]!);
  };
  const parts = (p: HTMLElement): Parts => ({
    no: $('.panel__no', p),
    meta: $('.panel__meta', p),
    geo: $('.panel__geo', p),
    title: $('.panel__title', p),
    meta2: [$('.panel__no', p), $('.panel__meta', p)],
  });

  createScene(root, {
    full: () => {
      const P = panels.map(parts);

      // The chapter title splits as the camera passes it: the two words are pushed
      // to opposite edges and the frame opens onto the first poster.
      const introLines = $$('.work__intro .mask__line', root);
      const introScroll = { trigger: '.work__intro', start: 'top 35%', end: 'bottom top', scrub: 0.3 };
      gsap.to(introLines[0] ?? [], { xPercent: -22, ease: 'none', scrollTrigger: introScroll });
      gsap.to(introLines[1] ?? [], { xPercent: 60, scale: 1.25, transformOrigin: '0% 100%', ease: 'none', scrollTrigger: introScroll });
      const tl = gsap.timeline({ defaults: { ease: EASE.inOut } });
      const swaps: number[] = [];
      const holds: number[] = [];
      gsap.set(panels.slice(1), { autoAlpha: 0 });
      progress.dataset.tone = isDark(panels[0]!) ? 'light' : 'dark';

      // The pass-through runs on the second poster: its letters become separate pieces,
      // and a red cube waits in the panel. Both exist only in full mode and are undone
      // on cleanup.
      const passPanel = panels[1]!;
      const pass = P[1]!;
      const passLines = $$('.panel__line', pass.title);
      const passText = passLines.map((l) => l.textContent ?? '');
      passLines.forEach((l, i) => l.replaceChildren(...Array.from(passText[i]!).map((ch) => h('span', { class: 'work__letter' }, ch))));
      const letters = $$('.work__letter', pass.title);
      // Per letter: which line, its place in that line from -1 (first) to 1 (last), and
      // whether it is the line's middle letter.
      const place = passText.flatMap((text, line) => {
        const n = text.length;
        return Array.from({ length: n }, (_, j) => ({
          line,
          k: n > 1 ? (j - (n - 1) / 2) / ((n - 1) / 2) : 0,
          mid: j === Math.floor((n - 1) / 2),
        }));
      });
      const thrown = (n: number): boolean => place[n]?.line === 0 && place[n]?.mid === true;
      const object = cube('red', 'work__object');
      passPanel.append(object);
      const objectSpin = $('.cube__spin', object);
      gsap.set(object, { scale: 0 });
      /** Centre of the title inside its panel, minus the object's half size. */
      const gap = (axis: 'x' | 'y') => (): number => {
        const pr = passPanel.getBoundingClientRect();
        const tr = pass.title.getBoundingClientRect();
        const half = object.offsetWidth / 2;
        return axis === 'x' ? tr.left - pr.left + tr.width / 2 - half : tr.top - pr.top + tr.height / 2 - half;
      };
      const mid = (axis: 'x' | 'y') => (): number =>
        (axis === 'x' ? passPanel.clientWidth : passPanel.clientHeight) / 2 - object.offsetWidth / 2;

      const hold = (p: Parts, at: number): number => {
        holds.push(at + HOLD / 2);
        tl.to(p.title, { scale: 1.06, duration: HOLD, ease: 'none' }, at)
          .to(p.geo, { yPercent: -6, rotation: '+=10', duration: HOLD, ease: 'none' }, at)
          .to(p.meta, { x: '-2vw', duration: HOLD, ease: 'none' }, at);
        return at + HOLD;
      };
      const swapTo = (i: number, at: number): void => {
        swaps.push(at);
        tl.set(panels[i - 1]!, { autoAlpha: 0 }, at)
          .set(panels[i]!, { autoAlpha: 1 }, at)
          .set(progress, { attr: { 'data-tone': isDark(panels[i]!) ? 'light' : 'dark' } }, at);
      };
      const metaIn = (p: Parts, at: number, from: gsap.TweenVars = { x: '6vw' }): void => {
        tl.fromTo(p.meta2, { ...from, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: DUR.meta, stagger: 0.05, ease: 'power2.out' }, at);
      };
      const metaOut = (p: Parts, at: number): void => {
        tl.to(p.meta2, { x: '-8vw', autoAlpha: 0, duration: DUR.meta, stagger: 0.04, ease: 'power2.in' }, at);
      };

      let t = 0;

      // 01 MUGHLAI DASTARKHWAN — enter: the name arrives, the geometry (handed over by
      // the relay) locks, metadata appears.
      const a = P[0]!;
      tl.fromTo(a.title, { yPercent: 105 }, { yPercent: 0, duration: 0.8, ease: EASE.out }, t)
        .fromTo(a.geo, { rotation: -15 }, { rotation: 0, duration: 0.4, ease: 'steps(3)' }, t + 0.15);
      metaIn(a, t + 0.35);
      t = hold(a, t + ENTER);

      // 01 → 02 — typography expansion: dive into the first letter while the field turns.
      {
        const next = panels[1]!;
        metaOut(a, t);
        tl.to(a.geo, { rotation: 102, scale: 0.4, autoAlpha: 0, duration: 0.5, ease: EASE.mechanical }, t)
          .set(a.title, { transformOrigin: () => letterOrigin(a.title) }, t)
          .to(a.title, { scale: 16, duration: 1.1, ease: 'power3.in' }, t + 0.1)
          .to(a.title, { color: bg(next), duration: 0.3, ease: 'power2.inOut' }, t + 0.85)
          .to(panels[0]!, { backgroundColor: bg(next), duration: 0.3, ease: 'power2.inOut' }, t + 0.85);
        t += CHANGE - 0.2;
        swapTo(1, t);
      }

      // 02 ALL INDIA JAMIAT RAYEEN — signature: the letters rise enormous and dominate the frame, the
      // circle travels behind them, then the type resolves and metadata settles in.
      tl.set(pass.title, { transformOrigin: 'left 75%' }, t)
        .fromTo(pass.title, { yPercent: 105, scale: 2.4 }, { yPercent: 0, duration: 0.7, ease: EASE.out }, t)
        .fromTo(pass.geo, { xPercent: -320, scale: 0.85 }, { xPercent: 0, scale: 1, duration: 1.3, ease: EASE.inOut }, t + 0.35)
        .to(pass.title, { scale: 1, duration: 0.9, ease: EASE.inOut }, t + 1.05);
      metaIn(pass, t + 1.55, { y: '2vh', x: 0 });
      t = hold(pass, t + SIGNATURE);

      // 02 → 03 — the pass-through. The name pushes past the frame and breaks open; a red
      // object appears in the gap and turns; the camera flies through it, and the next
      // poster opens from inside it.
      {
        metaOut(pass, t);
        tl.to(pass.geo, { scale: 0.4, autoAlpha: 0, duration: 0.35, ease: EASE.mechanical }, t)
          // The name swells past the edges…
          .set(pass.title, { transformOrigin: '50% 55%' }, t)
          .to(pass.title, { scale: 1.6, duration: 0.6, ease: 'power2.in' }, t)
          // …and comes apart: one letter is thrown out, the rest open a gap, the lines part.
          .to(
            letters,
            {
              x: (n: number) => `${(place[n]?.k ?? 0) * 11}vw`,
              yPercent: (n: number) =>
                thrown(n) ? -190 : (place[n]?.line === 0 ? -1 : 1) * (18 + Math.abs(place[n]?.k ?? 0) * 14),
              rotation: (n: number) => (thrown(n) ? 34 : (place[n]?.k ?? 0) * (n % 2 ? 10 : -8)),
              duration: 0.55,
              ease: 'power3.out',
            },
            t + 0.35,
          )
          // The object is cut into the gap and starts to turn.
          .set(object, { x: gap('x'), y: gap('y') }, t + 0.45)
          .fromTo(object, { scale: 0 }, { scale: 1.6, duration: 0.4, ease: EASE.out }, t + 0.45)
          .fromTo(objectSpin, { rotationY: -160, rotationX: 50 }, { rotationY: 120, rotationX: -20, duration: 1.5, ease: 'none' }, t + 0.45)
          // CAMERA PASS: the letters leave the frame and the object fills it.
          .to(letters, { x: (n: number) => `${(place[n]?.k ?? 0) * 55}vw`, duration: 0.7, ease: 'power3.in' }, t + 0.95)
          .to(
            object,
            {
              x: mid('x'),
              y: mid('y'),
              scale: () => (Math.hypot(passPanel.clientWidth, passPanel.clientHeight) / Math.max(1, object.offsetWidth)) * 1.4,
              duration: 0.75,
              ease: 'power3.in',
            },
            t + 0.95,
          );
        t += 1.65;
        // The next poster opens from the centre of the red, inside the object.
        swaps.push(t);
        tl.set(panels[2]!, { autoAlpha: 1 }, t)
          .fromTo(panels[2]!, { clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: EASE.out }, t)
          .set(progress, { attr: { 'data-tone': isDark(panels[2]!) ? 'light' : 'dark' } }, t)
          .set(passPanel, { autoAlpha: 0 }, t + 0.5);
      }

      // 03 CCS INFRATECH — spatial displacement: each element arrives from its own direction and locks.
      const d = P[2]!;
      tl.fromTo(d.title, { xPercent: -40, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.8, ease: EASE.out }, t)
        .fromTo(d.geo, { y: '-60vh', rotation: 90 }, { y: 0, rotation: 0, duration: 0.7, ease: EASE.mechanical }, t + 0.1);
      metaIn(d, t + 0.3, { x: '20vw' });
      hold(d, t + ENTER);

      const total = tl.duration();
      gsap
        .timeline({
          scrollTrigger: {
            trigger: gallery,
            start: 'top top',
            end: () => `+=${window.innerHeight * total * 0.62}`,
            pin: true,
            anticipatePin: 1,
            scrub: 0.3,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const now = self.progress * total;
              indexEl.textContent = String(swaps.filter((sw) => now >= sw).length + 1).padStart(2, '0');
              gsap.set(bar, { scaleX: self.progress });
            },
          },
        })
        .add(tl);

      // Keyboard users tab to a poster that is not on stage: move the scroll to its hold.
      const onFocus = (event: FocusEvent): void => {
        const panel = (event.target as Element).closest<HTMLElement>('.panel');
        if (!panel) return;
        const span = scrollBox(gallery).offsetHeight - window.innerHeight;
        scrollToY(pageTop(gallery) + span * ((holds[panels.indexOf(panel)] ?? 0) / total), { immediate: true });
      };
      gallery.addEventListener('focusin', onFocus);
      return () => {
        gallery.removeEventListener('focusin', onFocus);
        object.remove();
        passLines.forEach((l, i) => (l.textContent = passText[i]!));
      };
    },
    compact: () => {
      panels.forEach((panel) => {
        const st = { trigger: panel, start: 'top 75%', once: true };
        gsap.from($('.panel__title', panel), { yPercent: 40, autoAlpha: 0, duration: 1, ease: EASE.out, scrollTrigger: st });
        gsap.from($('.panel__geo', panel), { rotation: -90, scale: 0.5, duration: 0.6, ease: EASE.mechanical, scrollTrigger: st });
      });
    },
  });
}
