import { $ } from '../lib/dom';
import { EASE, gsap, isReduced } from '../lib/motion';

/**
 * THREAT → DETECTION → IMPACT → DEFLECTION → STABILISATION, told with three
 * objects and one word. The red triangle approaches; the blue defence turns to
 * meet it; on impact the whole stage tilts like a hit camera and BREACH cuts in;
 * the threat is turned away from the core, the frame levels out and the word is
 * replaced by SECURED. onState(i) fires as each of the four listed stages begins.
 */
export function runThreat(stage: HTMLElement, onState: (i: number) => void): Promise<void> {
  const threat = $('.threat', stage);
  const defense = $('.defense', stage);

  if (isReduced()) {
    [0, 1, 2, 3].forEach(onState);
    return new Promise((resolve) => window.setTimeout(resolve, 200));
  }

  const t = threat.getBoundingClientRect();
  const d = defense.getBoundingClientRect();
  const dx = d.left - t.right - 14;

  const core = $('.core', stage);
  const word = $('.security__word span', stage);
  const say = (text: string, color: string) => (): void => {
    word.textContent = text;
    word.style.color = color;
  };

  return new Promise((resolve) => {
    gsap
      .timeline({ onComplete: () => resolve() })
      .set(threat, { x: 0, y: 0, rotation: 90, scaleX: 1, autoAlpha: 1 })
      .to(word, { yPercent: -105, duration: 0.25, ease: 'power3.in' })
      // THREAT: it registers.
      .call(() => onState(0))
      .fromTo(threat, { scale: 1.25 }, { scale: 1, duration: 0.25, ease: 'steps(2)' })
      // APPROACH: slow and deliberate, stopping just short.
      .to(threat, { x: dx - 36, duration: 1, ease: EASE.inOut })
      // DETECTION: the defence turns to present its edge. Fast and exact.
      .call(() => onState(1))
      .to(defense, { rotation: 45, scale: 1.1, duration: 0.26, ease: 'steps(3)' })
      // IMPACT: the last distance closes at once; the shield takes it and recoils.
      .to(threat, { x: dx, scaleX: 0.78, duration: 0.12, ease: 'power2.in' })
      .call(() => onState(2))
      // IMPACT: the camera takes the hit and the word cuts in.
      .call(say('Breach', 'var(--c-red)'))
      .fromTo(word, { yPercent: 105 }, { yPercent: 0, duration: 0.14, ease: 'power4.out' }, '<')
      .to(stage, { rotationX: 14, rotationZ: -2.4, transformPerspective: 1100, duration: 0.09, ease: 'power2.out' }, '<')
      .to(defense, { x: 10, duration: 0.08, ease: 'power2.out' }, '<')
      .to(defense, { x: 0, duration: 0.3, ease: EASE.out })
      .to(stage, { rotationX: 0, rotationZ: 0, duration: 1.1, ease: EASE.out }, '<')
      // DEFLECTION: turned and sent up and away from the core, never through it.
      .to(threat, { scaleX: 1, rotation: 180, duration: 0.25, ease: 'steps(2)' }, '<')
      .call(() => onState(3))
      .to(threat, { x: dx - 80, y: -d.height * 2.4, rotation: 0, autoAlpha: 0, duration: 0.7, ease: 'power3.in' })
      // SYSTEM STABILISES: the defence squares up; the core settles last.
      .to(defense, { rotation: 0, scale: 1, duration: 0.6, ease: EASE.out }, '<0.15')
      .fromTo(core, { scale: 1.18 }, { scale: 1, duration: 0.5, ease: EASE.out }, '<0.2')
      // STABILISATION: the word is replaced, not faded.
      .to(word, { yPercent: -105, duration: 0.2, ease: 'power3.in' }, '<')
      .call(say('Secured', 'var(--c-cobalt)'))
      .fromTo(word, { yPercent: 105 }, { yPercent: 0, duration: 0.45, ease: EASE.out })
      .set(threat, { x: 0, y: 0, rotation: 90 }, '+=0.3')
      .to(threat, { autoAlpha: 1, duration: 0.3, ease: 'steps(3)' });
  });
}
