# AXIOMFORGE

A scroll-driven portfolio for AxiomForge, a three-person engineering team: software, cloud, web and security.
We build the interface, engineer the system behind it, put it into production, and secure what we ship.
Art direction: Bauhaus geometry × Swiss editorial grid × a quiet "digital instrument" layer.
Frontend only: **Vite + TypeScript + vanilla CSS + GSAP (core + ScrollTrigger) + Lenis**. There is no backend.

## Run locally

Requires Node.js 20.19+ or 22+.

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # typecheck + production build into dist/
npm run preview        # serve dist/ at http://localhost:4173
npm run check:visual   # with `npm run dev` running: screenshots + QA report in ./visual-check/
npm run check:scroll   # with `npm run dev` running: wheel/pin/nav/deep-link/refresh/resize QA in Edge + Chrome
```

`check:visual` drives the installed Microsoft Edge through `playwright-core` (no browser download). It covers 320 to 430 phone widths, 768 and 1024 tablets, 1366, 1440 and 1920 desktops plus reduced motion, on both pages, and reports console errors, horizontal overflow, frame pacing, the interactive flows and keyboard tab order.

## Contact form

The form sends through EmailJS's REST API (`src/lib/mail.ts`, no SDK). Only EmailJS's public identifiers are bundled; no SMTP password or private key is in the front end. The recipient, axiomforge.dev.03@gmail.com, is fixed in the EmailJS template, and the page never sends a recipient, so a visitor cannot redirect it. "Message sent." appears only after EmailJS confirms the request; until the keys are configured the form reports "Message not sent." and offers the address directly.

One-time setup (full steps in `.env.example`):

1. In EmailJS, connect a service (e.g. Gmail) for axiomforge.dev.03@gmail.com.
2. Create a template whose **To Email** is `axiomforge.dev.03@gmail.com` typed literally, with `{{form_title}}`, `{{from_name}}`, `{{reply_to}}`, `{{subject}}` and `{{message}}` in double braces (escaped, never HTML).
3. Restrict the account to the site's domain under Allowed origins.
4. Set `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID` and `VITE_EMAILJS_PUBLIC_KEY` in `.env.local` (or the host's environment) and rebuild.

Spam protection: a hidden honeypot field, a 30-second rest after each confirmed send, and length-limited, validated fields.

## Deploy

`dist/` is a static site with two pages (`index.html`, `projects.html`). Set the three `VITE_EMAILJS_*` variables in the host's build environment. On Vercel or Netlify the build command is `npm run build` and the output directory is `dist`. For GitHub Pages under a sub-path, build with `npx vite build --base=/<repo>/`.

## Structure

```
src/
  data/portfolioData.ts   all copy and content (marked TODO(content) where unconfirmed)
  sections/               DOM + interaction per chapter (chrome, hero + forge intro, philosophy,
                          people + profile panel, work + caseStudy, system, security, lab, contact,
                          archive: the Projects page)
  animations/             GSAP choreography per chapter + site-wide behaviour
  lib/
    motion.ts             motion modes, easing/duration tokens, createScene()
    scroll.ts             Lenis on the GSAP ticker, pin-aware scrollTo, deep-link/refresh restore
    dom.ts                safe element builder (no innerHTML), shapes, masked lines
    cursor.ts             precision cursor (desktop, fine pointer only)
    velocity.ts           scroll-velocity skew/stretch, settling back to square
    sound.ts              optional Web Audio clicks, off by default
  style.css               tokens first, then components; full-motion and mobile layouts
  main.ts / projects.ts   the two page entries (index.html, projects.html; see vite.config.ts)
```

## Scroll engine

One clock drives everything (`src/lib/scroll.ts`):

```
input → Lenis → gsap.ticker → ScrollTrigger → scenes → geometry / type
```

- Lenis smooths wheel and trackpad input on desktop only, with `lerp: 0.14` so it stays responsive rather than floaty. It runs on GSAP's ticker (no separate requestAnimationFrame), and every Lenis scroll updates ScrollTrigger in the same frame.
- Touch devices and `prefers-reduced-motion` keep native scrolling.
- There is no scroll snapping anywhere: the page is never pulled away from where the visitor put it.
- Deep links (`/#work`) and mid-page refreshes are restored after ScrollTrigger has measured the pins.
- Nav clicks scroll through the same engine to pin-aware positions.

## Intro: the forge

A ~1.25s sequence that never blocks scrolling (any input fast-forwards it): the grid snaps in and an interface frame draws (frontend), structured nodes connect (software), an orbit closes around them (cloud), a red threat meets a blue boundary and is turned away (security). Everything compresses to a point, AXIOMFORGE is forged from it and travels into the header, and the hero's geometry expands out of the forged centre. The precision object, a machined CSS 3D cube (`cube()` in `src/lib/dom.ts`), is cut at the core, turns once toward the camera and is set down on the beam. The first scroll is a camera push: the headline scales through the frame, the circle swells and the cube turns toward the viewer. The same cube, now black, settles into the yellow end card.

## People

Three subsystems: Himanshu (software engineering, square), Saurabh (cloud & infrastructure, circle), Ayan (frontend & security, triangle). Scroll or hover moves focus between them; then their symbols converge on one beam and AXIOMFORGE is forged, the bridge into the work. Each person has a deep profile panel.

## Motion system

Continuity: one piece of geometry is handed between chapters (`src/animations/relay.ts`). The hero circle becomes the people graphic, the people triangle becomes the first featured poster's gold triangle, the last poster's square becomes the process marker, the marker becomes the security shield, and the shield becomes the payment object.

Project changes: each title dives into its first letterform while the field turns to the next poster's colour, and the next poster rises through it (`src/animations/work.ts`). Case studies open from the poster's own shape into the opposite field (`src/sections/caseStudy.ts`).

Projects: one list in `src/data/portfolioData.ts` feeds both pages. Exactly three projects carry `featured: true` (Mughlai Dastarkhwan, All India Jamiat Rayeen, CCS Infratech) and form the homepage's Featured Work; `projects.html` is the full archive, in shelves: client work, flagship engineering, production implementations, software / experiments, the current initiative, and the operating portfolio (environments run in production, listed as domains rather than projects). Every project is a mini case study (what it was, the problem, how it is used, what was built, technology, architecture, team, outcome), written only from its live site or the team's supplied material; empty fields are never shown, projects without a public URL say "Production system" or "Internal implementation", and every count is computed from the data. Featured posters: Mughlai dives into its first letterform; AIJR rises enormous while its circle crosses behind it, then takes the pass-through (the name breaks apart, a red cube turns in the gap, the camera flies through it), and CCS Infratech opens from inside the red. "View all projects →" leads to the archive.

Cursor: modal dialogs render in the browser's top layer, so the custom cursor moves into whichever modal is open and back to the page on close (`src/lib/cursor.ts`); if it ever cannot, the native cursor is restored.

Colour: every chapter has a dominant field (hero ivory, people black, work black/red, process cobalt, security black, contact yellow). Fields change through authored wipes (circle, diagonal, inset) scrubbed by the scroll, never fades (`colourWipes()` in `src/animations/site.ts`, `[data-tone]` / `[data-from]` in CSS).

Process: the words are physical states. BUILD is constructed letter by letter, BREAK cracks apart while the red triangle shatters into shards, DEFEND pulls the pieces back into one ivory square.

Security: the story plays once on its own when the stage comes into frame. THREAT, DETECTION, then IMPACT: the stage tilts like a hit camera and BREACH cuts in. Then DEFLECTION, and STABILISATION, where the frame levels and SECURED replaces it.

Dev QA: `http://localhost:5173/?qa` exposes ScrollTrigger to the QA scripts (dev builds only).


| Mode | When | Behaviour |
| --- | --- | --- |
| `full` | ≥ 60rem wide and ≥ 38rem tall | Pinned chapters, horizontal work gallery, cursor, velocity |
| `compact` | Smaller screens | No pinning; stacked compositions; short reveals |
| `reduced` | `prefers-reduced-motion: reduce` | Opacity and instant states only |

Motion language: geometry is fast and mechanical, type is slow and weighted, metadata is very fast, and transitions between chapters are large. The mode is mirrored on `<html data-motion>`, and switching modes reverts every tween and pin.

## Before launch

Configure the contact form (above). Add studio social links in `brand.socials` in `src/data/portfolioData.ts` if wanted; only links with a URL are shown.

Team copy comes only from the supplied profiles of Himanshu Vishwakarma, Saurabh Maurya and Ayan Abbas; do not add facts beyond them.
