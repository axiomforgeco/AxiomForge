import { createScene, gsap } from '../lib/motion';

/** Scene 6: the button leans toward the pointer, then snaps back. Fine pointers only. */
export function magnetize(button: HTMLElement, strength = 0.35): void {
  const zone = button.parentElement ?? button;
  const inner = button.querySelector<HTMLElement>('.btn__inner');

  const attach = (): (() => void) | void => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const xTo = gsap.quickTo(button, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(button, 'y', { duration: 0.35, ease: 'power3' });
    const ixTo = inner ? gsap.quickTo(inner, 'x', { duration: 0.35, ease: 'power3' }) : null;
    const iyTo = inner ? gsap.quickTo(inner, 'y', { duration: 0.35, ease: 'power3' }) : null;

    const move = (event: PointerEvent): void => {
      const r = button.getBoundingClientRect();
      const dx = event.clientX - (r.left + r.width / 2);
      const dy = event.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      ixTo?.(dx * strength * 0.4);
      iyTo?.(dy * strength * 0.4);
    };
    const leave = (): void => {
      xTo(0);
      yTo(0);
      ixTo?.(0);
      iyTo?.(0);
    };
    zone.addEventListener('pointermove', move);
    zone.addEventListener('pointerleave', leave);
    return () => {
      zone.removeEventListener('pointermove', move);
      zone.removeEventListener('pointerleave', leave);
    };
  };

  createScene(button, { full: attach, compact: attach });
}
