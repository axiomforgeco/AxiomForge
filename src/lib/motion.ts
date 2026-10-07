import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Motion modes. Every scene supports all three:
 * - full:    pinned, scrubbed scenes (large viewports)
 * - compact: no pinning; short reveals (phones, short windows)
 * - reduced: prefers-reduced-motion, so opacity, simple transforms and instant states
 */
export type MotionMode = 'full' | 'compact' | 'reduced';

/**
 * Motion language. Geometry is fast and precise, typography slow and weighted,
 * metadata very fast, and section transitions large and cinematic.
 */
export const EASE = {
  out: 'expo.out',
  inOut: 'power3.inOut',
  cinematic: 'power4.inOut',
  mechanical: 'power2.inOut',
} as const;

export const DUR = {
  meta: 0.3,
  geometry: 0.6,
  type: 1.2,
  scene: 1.4,
} as const;

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

/** Dev-only QA switch (`?qa`): disables scroll snapping so transitions can be filmed frame by frame. */
export const QA = import.meta.env.DEV && new URLSearchParams(window.location.search).has('qa');

let mode: MotionMode = 'reduced';
export const getMode = (): MotionMode => mode;
export const isReduced = (): boolean => mode === 'reduced';

/** Registers plugins and mirrors the active mode on <html data-motion>, which CSS layouts key off. */
export function initMotion(): void {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: EASE.inOut, duration: DUR.geometry });
  gsap.matchMedia().add(CONDITIONS, (ctx) => {
    mode = resolveMode(ctx.conditions ?? {});
    document.documentElement.dataset.motion = mode;
  });
  if (QA) Object.assign(window, { __ST: ScrollTrigger });
  // Web fonts change text metrics, so pins must be re-measured once they arrive.
  void document.fonts.ready.then(() => ScrollTrigger.refresh());
}

type Builder = (ctx: gsap.Context) => void | (() => void);

/**
 * Builds a scene per motion mode. gsap.matchMedia reverts every tween and
 * ScrollTrigger made inside a builder when the mode changes, so nothing leaks.
 */
export function createScene(scope: Element, builders: Partial<Record<MotionMode, Builder>>): void {
  gsap.matchMedia(scope).add(CONDITIONS, (ctx) => builders[resolveMode(ctx.conditions ?? {})]?.(ctx));
}

/** Scrolls to an element, measuring GSAP pin spacers instead of pinned sections. */
export function scrollToElement(target: HTMLElement): void {
  const parent = target.parentElement;
  const anchor = parent?.classList.contains('pin-spacer') ? parent : target;
  const top = anchor.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top, behavior: isReduced() ? 'auto' : 'smooth' });
}

/** The pin-spacer for a pinned section, or the section itself. */
export function scrollBox(el: HTMLElement): HTMLElement {
  return el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
}

export { gsap, ScrollTrigger };
