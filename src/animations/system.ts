import { processStages } from '../data/portfolioData';
import { $, $$ } from '../lib/dom';
import { createScene, EASE, gsap } from '../lib/motion';
import { sound } from '../lib/sound';

const SQUARE = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
const TRIANGLE = 'polygon(50% 0%, 50% 0%, 100% 100%, 0% 100%)';

// The BREAK triangle cut into four shards (three corners and the middle)…
const SHARDS_TRIANGLE = [
  'polygon(50% 0%, 75% 50%, 25% 50%)',
  'polygon(75% 50%, 100% 100%, 50% 100%)',
  'polygon(25% 50%, 50% 100%, 0% 100%)',
  'polygon(75% 50%, 50% 100%, 25% 50%)',
];
// …and the DEFEND square cut into four from its centre. Same point count, so each
// shard can change shape on its way back.
const SHARDS_SQUARE = [
  'polygon(0% 0%, 100% 0%, 50% 50%)',
  'polygon(100% 0%, 100% 100%, 50% 50%)',
  'polygon(0% 100%, 0% 0%, 50% 50%)',
  'polygon(100% 100%, 0% 100%, 50% 50%)',
];
// Where each shard is thrown when the shape fractures (% of its size, degrees).
const SCATTER = [
  { xPercent: 18, yPercent: -62, rotation: -28 },
  { xPercent: 40, yPercent: 34, rotation: 34 },
  { xPercent: -64, yPercent: 22, rotation: -40 },
  { xPercent: -8, yPercent: 74, rotation: 16 },
];
// The crack through the word BREAK: small fixed offsets per letter, in em.
const CRACK = [
  { x: -0.03, y: -0.06, rotation: -6 },
  { x: 0.02, y: 0.09, rotation: 5 },
  { x: -0.01, y: -0.12, rotation: -9 },
  { x: 0.04, y: 0.05, rotation: 11 },
  { x: 0.06, y: -0.04, rotation: -4 },
];

/**
 * The process runs like a machine: the line draws with scroll, the marker
 * travels it, and at each station the oversized word, the geometry and the
 * stage data switch over in discrete, mechanical steps. The words are physical
 * states: BUILD is constructed letter by letter, BREAK fractures (the word and
 * the shape both crack apart), DEFEND pulls the pieces back into one solid form.
 */
export function animateSystem(root: HTMLElement): void {
  const stages = $$('.stage', root);
  const words = $$('.system__word', root);
  const morph = $('.system__morph', root);
  const css = getComputedStyle(document.documentElement);

  const mark = (active: number): void => {
    stages.forEach((st, i) => {
      st.classList.toggle('is-reached', i <= active);
      st.classList.toggle('is-active', i === active);
    });
  };

  createScene(root, {
    full: () => {
      let current = 0;
      const lines = words.map((w) => $('.mask__line', w));
      const letters = words.map((w) => $$('.system__letter', w));
      const shardBox = $('.system__shards', root);
      const shards = $$('i', shardBox);
      const em = (w: HTMLElement): number => parseFloat(getComputedStyle(w).fontSize);
      gsap.set(letters.slice(1).flat(), { scaleY: 0, transformOrigin: '50% 100%' });
      // The shards share the morph's turn at BREAK (180°), so they tile it exactly.
      gsap.set(shardBox, { rotation: 180, autoAlpha: 0 });
      const stageShape = (i: number): gsap.TweenVars => {
        const st = processStages[i]!;
        return {
          backgroundColor: css.getPropertyValue(`--${st.accent}`).trim(),
          borderRadius: st.shape === 'circle' ? '50%' : '0%',
          clipPath: st.shape === 'triangle' ? TRIANGLE : SQUARE,
          rotation: i * 90,
        };
      };
      gsap.set(morph, stageShape(0));
      mark(0);

      // Every word leaves the same way: its letters are taken down from the top, in steps.
      const leave = (i: number, dir: number): void => {
        if (i === 0) {
          gsap.to(lines[0]!, { yPercent: -110 * dir, duration: 0.7, ease: EASE.inOut, overwrite: true });
          return;
        }
        gsap.killTweensOf(letters[i]!);
        gsap.to(letters[i]!, { scaleY: 0, x: 0, y: 0, rotation: 0, transformOrigin: '50% 0%', duration: 0.3, ease: 'steps(3)', stagger: 0.025 });
      };

      const enter = (i: number, dir: number): void => {
        const ls = letters[i]!;
        if (i === 0) {
          gsap.fromTo(lines[0]!, { yPercent: 110 * dir }, { yPercent: 0, duration: 0.9, ease: EASE.out, overwrite: true });
          return;
        }
        gsap.killTweensOf(ls);
        if (i === 1) {
          // BUILD: constructed from the baseline up, one block at a time.
          gsap.fromTo(ls, { scaleY: 0, x: 0, y: 0, rotation: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.42, ease: 'steps(4)', stagger: 0.07 });
        } else if (i === 2) {
          // BREAK: it arrives whole, then cracks through every letter.
          const size = em(words[2]!);
          gsap
            .timeline()
            .fromTo(ls, { scaleY: 0, x: 0, y: 0, rotation: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.24, ease: 'steps(3)', stagger: 0.03 })
            .to(
              ls,
              {
                x: (n: number) => (CRACK[n]?.x ?? 0) * size,
                y: (n: number) => (CRACK[n]?.y ?? 0) * size,
                rotation: (n: number) => CRACK[n]?.rotation ?? 0,
                transformOrigin: '50% 50%',
                duration: 0.32,
                ease: 'power4.out',
              },
              '+=0.08',
            );
        } else {
          // DEFEND: the pieces are pulled in from where they flew and lock into line.
          const size = em(words[3]!);
          gsap.fromTo(
            ls,
            {
              scaleY: 1,
              x: (n: number) => (n % 2 ? 1 : -1) * (0.5 + n * 0.12) * size,
              y: (n: number) => (n % 3 === 0 ? -1 : 1) * 0.45 * size,
              rotation: (n: number) => (n % 2 ? 38 : -30),
              transformOrigin: '50% 50%',
            },
            { x: 0, y: 0, rotation: 0, duration: 0.8, ease: EASE.out, stagger: { each: 0.04, from: 'edges' } },
          );
        }
      };

      // The geometry follows the word: it shatters on BREAK and is rebuilt on DEFEND.
      const red = css.getPropertyValue('--c-red').trim();
      const ivory = css.getPropertyValue('--c-ivory').trim();
      const scattered = {
        clipPath: (n: number) => SHARDS_TRIANGLE[n]!,
        backgroundColor: red,
        xPercent: (n: number) => SCATTER[n]!.xPercent,
        yPercent: (n: number) => SCATTER[n]!.yPercent,
        rotation: (n: number) => SCATTER[n]!.rotation,
      };
      let shardTl: gsap.core.Timeline | null = null;
      const shardsOff = (): void => {
        shardTl?.kill();
        gsap.set(shardBox, { autoAlpha: 0 });
        gsap.set(morph, { autoAlpha: 1 });
      };
      const shatter = (): void => {
        shardTl?.kill();
        shardTl = gsap
          .timeline()
          // Once the morph has become the red triangle, it is swapped for its shards…
          .set(shards, { ...scattered, xPercent: 0, yPercent: 0, rotation: 0 }, 0.5)
          .set(shardBox, { autoAlpha: 1 }, 0.5)
          .set(morph, { autoAlpha: 0 }, 0.5)
          // …which are thrown apart.
          .to(shards, { xPercent: scattered.xPercent, yPercent: scattered.yPercent, rotation: scattered.rotation, duration: 0.45, ease: 'power4.out' }, 0.56);
      };
      const rebuild = (fromBreak: boolean): void => {
        shardTl?.kill();
        const tl = (shardTl = gsap.timeline());
        if (!fromBreak) tl.set(shards, scattered);
        tl.set(shardBox, { autoAlpha: 1 }, 0)
          .set(morph, { autoAlpha: 0 }, 0)
          .to(shards, { xPercent: 0, yPercent: 0, rotation: 0, clipPath: (n: number) => SHARDS_SQUARE[n]!, duration: 0.75, ease: EASE.inOut, stagger: 0.04 }, 0)
          // Signals never blend: the colour switches once the pieces are halfway home.
          .set(shards, { backgroundColor: ivory }, 0.4)
          .set(morph, { autoAlpha: 1 })
          .set(shardBox, { autoAlpha: 0 });
      };

      const go = (next: number): void => {
        if (next === current) return;
        const dir = next > current ? 1 : -1;
        leave(current, dir);
        enter(next, dir);
        const { backgroundColor, ...shape } = stageShape(next);
        gsap.to(morph, { ...shape, duration: 0.5, ease: EASE.mechanical, overwrite: 'auto' });
        // Colour switches at the midpoint of the morph; signals never blend.
        gsap.set(morph, { backgroundColor, delay: 0.25 });
        if (next === 2) shatter();
        else if (next === 3) rebuild(current === 2);
        else shardsOff();
        current = next;
        mark(next);
        sound.tick();
      };

      // ENTER → ACTIVATE → HOLD → EXIT at every station. The marker travels with
      // weight, arrives, pulses in the stage colour, holds while the station is live,
      // then leaves; the line behind it fills to exactly where it stands.
      const line = $('.system__line', root);
      const at = (i: number) => () => (line.offsetWidth * i) / (processStages.length - 1);
      const arrivals: number[] = [];
      const run = gsap.timeline({ defaults: { ease: EASE.inOut } });
      processStages.forEach((st, i) => {
        const t = run.duration();
        arrivals.push(t);
        run
          .to('.system__marker', { scale: 1.9, backgroundColor: css.getPropertyValue(`--${st.accent}`).trim(), duration: 0.18, ease: 'steps(2)' }, t)
          .to('.system__marker', { scale: 1, backgroundColor: css.getPropertyValue('--c-ivory').trim(), duration: 0.3, ease: EASE.out }, t + 0.18)
          .to({}, { duration: 0.6 }, t + 0.48);
        if (i < processStages.length - 1) {
          const leave = run.duration();
          run
            .to('.system__marker', { x: at(i + 1), duration: 1, ease: EASE.inOut }, leave)
            .to('.system__fill', { scaleX: (i + 1) / (processStages.length - 1), duration: 1, ease: EASE.inOut }, leave);
        }
      });

      gsap.set('.system__fill', { scaleX: 0 });
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: () => `+=${window.innerHeight * 2.6}`,
            pin: true,
            anticipatePin: 1,
            scrub: 0.25,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const now = self.progress * run.duration();
              go(Math.max(0, arrivals.filter((a) => now >= a - 0.02).length - 1));
            },
          },
        })
        .add(run);

      return () => mark(processStages.length - 1);
    },
    compact: () => {
      gsap.fromTo(
        '.system__fill',
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.system__track', start: 'top 70%', end: 'bottom 60%', scrub: true } },
      );
      stages.forEach((st) => {
        gsap.from(st, { autoAlpha: 0, y: 24, duration: 0.6, ease: EASE.out, scrollTrigger: { trigger: st, start: 'top 85%', once: true } });
      });
      mark(processStages.length - 1);
    },
    reduced: () => mark(processStages.length - 1),
  });
}
