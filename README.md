# PRIMITIVES — Team Portfolio

A scroll-driven, Bauhaus-styled portfolio for a three-person engineering collective.
Frontend only: **Vite + TypeScript + vanilla CSS + GSAP (core + ScrollTrigger)**. There is no backend; everything runs in the browser.

## Run locally

Requires Node.js 20.19+ or 22+.

```bash
npm install        # install dependencies
npm run dev        # dev server at http://localhost:5173
npm run typecheck  # strict TypeScript check
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build at http://localhost:4173
```

## Deploy

`dist/` is a static site. Any static host works:

- **Vercel / Netlify:** import the repo. Build command `npm run build`, output directory `dist`.
- **GitHub Pages:** build, then publish `dist/`. If the site is served from a sub-path (`/<repo>/`), build with `npx vite build --base=/<repo>/`.

## Structure

```
src/
  data/portfolioData.ts   all copy: team, projects, pipeline, attacks, lab mocks, contact email
  sections/               one module per scene; builds DOM and wires interaction
  animations/             GSAP timelines and ScrollTriggers per scene
  lib/
    motion.ts             plugin registration + createScene (full / compact / reduced modes)
    dom.ts                safe element builder (no innerHTML) + shape SVGs
    sound.ts              Web Audio clicks (off by default)
    splitText.ts          free letter splitter for the hero reveal
  style.css               design tokens, components, scene layouts
```

## Motion and accessibility

Every scene runs in one of three modes, chosen by `gsap.matchMedia` and mirrored on `<html data-motion>`:

| Mode | When | Behaviour |
| --- | --- | --- |
| `full` | Viewport ≥ 60rem wide and ≥ 38rem tall | Pinned, scrubbed scenes; horizontal project tunnel |
| `compact` | Smaller screens | No pinning; short reveals; projects stack vertically |
| `reduced` | `prefers-reduced-motion: reduce` | No pinning or scrubbing; instant states and simple fades |

Switching modes (resizing, or toggling the OS setting) reverts every tween and ScrollTrigger cleanly.
Everything is keyboard-operable: team tabs use arrow keys, case files are native `<dialog>`s (Esc closes), and focus is always visible.

## Editing content

Change text, people, projects and metrics in `src/data/portfolioData.ts`. Set the real inbox in `brand.email`.

The payment simulator only accepts Stripe's published test numbers (`4242 4242 4242 4242`, `4000 0000 0000 0002`, `4000 0000 0000 9995`). Any other number is cleared immediately and never stored.
