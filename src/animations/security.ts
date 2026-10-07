import { $ } from '../lib/dom';
import { gsap, isReduced } from '../lib/motion';

/** Scene 4: the red triangle hits the blue shield, which turns solid and throws it back. */
export function strike(arena: HTMLElement, { onImpact }: { onImpact: () => void }): Promise<void> {
  const attacker = $('.arena__attacker', arena);
  const shield = $('.arena__shield', arena);
  const flash = $('.arena__flash', arena);

  if (isReduced()) {
    shield.classList.add('is-solid');
    onImpact();
    return new Promise((resolve) => window.setTimeout(resolve, 400));
  }

  shield.classList.remove('is-solid');
  const dx = shield.getBoundingClientRect().left - attacker.getBoundingClientRect().right;

  return new Promise((resolve) => {
    gsap
      .timeline({ onComplete: () => resolve() })
      .set(attacker, { x: 0, y: 0, rotation: 0, autoAlpha: 1 })
      .to(attacker, { x: dx, duration: 0.7, ease: 'power3.in' })
      .add(() => {
        shield.classList.add('is-solid');
        onImpact();
      })
      .to(shield, { x: 12, duration: 0.05, ease: 'steps(1)', yoyo: true, repeat: 3 })
      .fromTo(
        flash,
        { autoAlpha: 1, scale: 0.2 },
        { autoAlpha: 0, scale: 1.5, duration: 0.45, ease: 'power3.out' },
        '<',
      )
      .to(
        attacker,
        { x: dx * 0.3, y: -110, rotation: -225, autoAlpha: 0, duration: 0.65, ease: 'power3.out' },
        '<',
      )
      .to({}, { duration: 0.35 })
      .set(attacker, { x: 0, y: 0, rotation: 0 })
      .to(attacker, { autoAlpha: 1, duration: 0.3, ease: 'steps(3)' });
  });
}
