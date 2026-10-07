import { $ } from '../lib/dom';
import { EASE, gsap, isReduced } from '../lib/motion';

/**
 * THREAT → SYSTEM → DEFLECTION, told with three objects. The red triangle
 * approaches; the blue defence turns to meet it; the threat is held, turned and
 * sent away from the core; the system settles. onState(i) fires as each of the
 * four stages begins (threat, detection, analysis, response).
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

  return new Promise((resolve) => {
    gsap
      .timeline({ onComplete: () => resolve() })
      .set(threat, { x: 0, y: 0, rotation: 90, autoAlpha: 1 })
      .call(() => onState(0))
      // Threat: a slow, deliberate approach.
      .to(threat, { x: dx, duration: 1.1, ease: EASE.inOut })
      // Detection: the defence turns to present its edge. Fast and exact.
      .call(() => onState(1))
      .to(defense, { rotation: 45, scale: 1.1, duration: 0.28, ease: 'steps(3)' })
      // Analysis: the threat is held and turned.
      .call(() => onState(2))
      .to(threat, { rotation: 180, duration: 0.3, ease: 'steps(2)' }, '+=0.15')
      // Response: redirected up and away from the core, never through it.
      .call(() => onState(3))
      .to(threat, { x: dx - 80, y: -d.height * 2.4, rotation: 0, autoAlpha: 0, duration: 0.75, ease: 'power3.in' })
      // The system settles.
      .to(defense, { rotation: 0, scale: 1, duration: 0.6, ease: EASE.out }, '<0.2')
      .set(threat, { x: 0, y: 0, rotation: 90 }, '+=0.3')
      .to(threat, { autoAlpha: 1, duration: 0.3, ease: 'steps(3)' });
  });
}
