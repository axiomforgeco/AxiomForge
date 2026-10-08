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

/** Dev-only QA switch (`?qa`): exposes ScrollTrigger to the QA scripts. Stripped from production builds. */
export const QA = import.meta.env.DEV && new URLSearchParams(window.location.search).has('qa');

let mode: MotionMode = 'reduced';
export const getMode = (): MotionMode => mode;
export const isReduced = (): boolean => mode === 'reduced';

/** Registers plugins and mirrors the active mode on <html data-motion>, which CSS layouts key off. */
export function initMotion(): void {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: EASE.inOut, duration: DUR.geometry });
  // Mobile address bars resize the viewport while scrolling; re-measuring then causes jumps.
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.matchMedia().add(CONDITIONS, (ctx) => {
    mode = resolveMode(ctx.conditions ?? {});
    document.documentElement.dataset.motion = mode;
  });
  if (QA) Object.assign(window, { __ST: ScrollTrigger, __gsap: gsap });
}

type Builder = (ctx: gsap.Context) => void | (() => void);

/**
 * Builds a scene per motion mode. gsap.matchMedia reverts every tween and
 * ScrollTrigger made inside a builder when the mode changes, so nothing leaks.
 */
export function createScene(scope: Element, builders: Partial<Record<MotionMode, Builder>>): void {
  gsap.matchMedia(scope).add(CONDITIONS, (ctx) => builders[resolveMode(ctx.conditions ?? {})]?.(ctx));
}

/** The pin-spacer for a pinned section, or the section itself. */
export function scrollBox(el: HTMLElement): HTMLElement {
  return el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
}

/** Document y of an element's start, measuring pin spacers instead of pinned sections. */
export function pageTop(el: HTMLElement): number {
  return scrollBox(el).getBoundingClientRect().top + window.scrollY;
}

export { gsap, ScrollTrigger };
