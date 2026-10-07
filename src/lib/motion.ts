import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Every scene supports three motion modes:
 * - full:    pinned, scrub-driven scenes (large viewports)
 * - compact: short non-pinned reveals (phones, short windows)
 * - reduced: prefers-reduced-motion, so instant states and simple fades
 */
export type MotionMode = 'full' | 'compact' | 'reduced';

const CONDITIONS = {
  reduced: '(prefers-reduced-motion: reduce)',
  wide: '(min-width: 60rem) and (min-height: 38rem)',
  any: 'all',
} as const;

type Conditions = Partial<Record<keyof typeof CONDITIONS, boolean>>;

export function resolveMode(conditions: Conditions): MotionMode {
  if (conditions.reduced) return 'reduced';
  return conditions.wide ? 'full' : 'compact';
}

let mode: MotionMode = 'reduced';
export const getMode = (): MotionMode => mode;
export const isReduced = (): boolean => mode === 'reduced';

export function headerOffset(): number {
  return document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;
}

/** Registers plugins and mirrors the active mode on <html data-motion>, which CSS layouts key off. */
export function initMotion(): void {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.inOut', duration: 0.6 });
  gsap.matchMedia().add(CONDITIONS, (ctx) => {
    mode = resolveMode(ctx.conditions ?? {});
    document.documentElement.dataset.motion = mode;
  });
  // Web fonts change text metrics, so pins must be re-measured once they arrive.
  void document.fonts.ready.then(() => ScrollTrigger.refresh());
}

type Builder = (ctx: gsap.Context) => void | (() => void);

/**
 * Builds a scene per motion mode. gsap.matchMedia reverts all tweens and
 * ScrollTriggers made inside a builder when the mode changes, so nothing leaks.
 */
export function createScene(scope: Element, builders: Partial<Record<MotionMode, Builder>>): void {
  gsap.matchMedia(scope).add(CONDITIONS, (ctx) => builders[resolveMode(ctx.conditions ?? {})]?.(ctx));
}

/** Scrolls to an element, accounting for the fixed header and GSAP pin spacers. */
export function scrollToElement(target: HTMLElement): void {
  const parent = target.parentElement;
  const anchor = parent?.classList.contains('pin-spacer') ? parent : target;
  const top = anchor.getBoundingClientRect().top + window.scrollY - headerOffset();
  window.scrollTo({ top, behavior: isReduced() ? 'auto' : 'smooth' });
}

export { gsap, ScrollTrigger };
