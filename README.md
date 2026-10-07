# ORTHO — Digital Systems Studio

A scroll-driven portfolio for a three-person studio (engineering, design, security).
Art direction: Bauhaus geometry × Swiss editorial grid × a quiet "digital instrument" layer.
Frontend only: **Vite + TypeScript + vanilla CSS + GSAP (core + ScrollTrigger)**. There is no backend.

## Run locally

Requires Node.js 20.19+ or 22+.

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # typecheck + production build into dist/
npm run preview        # serve dist/ at http://localhost:4173
npm run check:visual   # with `npm run dev` running: screenshots + QA report in ./visual-check/
```

`check:visual` drives the installed Microsoft Edge through `playwright-core` (no browser download). It covers 1440, 1920 and 375 widths plus reduced motion, and reports console errors, horizontal overflow, frame pacing, the interactive flows and keyboard tab order.

## Deploy

`dist/` is a static site. On Vercel or Netlify the build command is `npm run build` and the output directory is `dist`. For GitHub Pages under a sub-path, build with `npx vite build --base=/<repo>/`.

## Structure

```
src/
  data/portfolioData.ts   all copy and content (marked TODO(content) where unconfirmed)
  sections/               DOM + interaction per chapter (chrome, hero, philosophy, people,
                          work + caseStudy, system, security, lab, contact)
  animations/             GSAP choreography per chapter + site-wide behaviour
  lib/
    motion.ts             motion modes, easing/duration tokens, createScene()
    dom.ts                safe element builder (no innerHTML), shapes, masked lines
    cursor.ts             precision cursor (desktop, fine pointer only)
    velocity.ts           scroll-velocity skew/stretch, settling back to square
    sound.ts              optional Web Audio clicks, off by default
  style.css               tokens first, then components; full-motion and mobile layouts
```

## Motion system

Continuity: one piece of geometry is handed between chapters (`src/animations/relay.ts`). The hero circle becomes the people graphic, the people triangle becomes REVENANT's triangle, the last poster's square becomes the process marker, the marker becomes the security shield, and the shield becomes the payment object.

Project changes: each title dives into its first letterform while the field turns to the next poster's colour, and the next poster rises through it (`src/animations/work.ts`). Case studies open from the poster's own shape into the opposite field (`src/sections/caseStudy.ts`).

Dev QA: open `http://localhost:5173/?qa` to disable scroll snapping (dev builds only) so transitions can be inspected frame by frame.


| Mode | When | Behaviour |
| --- | --- | --- |
| `full` | ≥ 60rem wide and ≥ 38rem tall | Pinned chapters, horizontal work gallery, cursor, velocity |
| `compact` | Smaller screens | No pinning; stacked compositions; short reveals |
| `reduced` | `prefers-reduced-motion: reduce` | Opacity and instant states only |

Motion language: geometry is fast and mechanical, type is slow and weighted, metadata is very fast, and transitions between chapters are large. The mode is mirrored on `<html data-motion>`, and switching modes reverts every tween and pin.

## Before launch

Fill in everything marked `TODO(content)` in `src/data/portfolioData.ts`: the studio name, real email, social links, teammate names, and confirmed copy and stack for REVENANT, WRAITH and RAVEN.
