import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './style.css';

import { magnetize } from './animations/contact';
import { animateHero } from './animations/hero';
import { animatePeople } from './animations/people';
import { animatePhilosophy } from './animations/philosophy';
import { initRelay } from './animations/relay';
import { animateSite } from './animations/site';
import { animateSystem } from './animations/system';
import { animateWork } from './animations/work';
import { initCursor } from './lib/cursor';
import { $, h } from './lib/dom';
import { initMotion, pageTop, ScrollTrigger } from './lib/motion';
import { initSmoothScroll, restorePosition } from './lib/scroll';
import { initSound } from './lib/sound';
import { initVelocity } from './lib/velocity';
import { renderFooter, renderHeader } from './sections/chrome';
import { renderContact } from './sections/contact';
import { renderHero } from './sections/hero';
import { renderLab } from './sections/lab';
import { renderPeople } from './sections/people';
import { renderPhilosophy } from './sections/philosophy';
import { renderSecurity } from './sections/security';
import { renderSystem } from './sections/system';
import { renderWork } from './sections/work';

const hero = renderHero();
const philosophy = renderPhilosophy();
const people = renderPeople();
const work = renderWork();
const system = renderSystem();
const contact = renderContact();

$('#app').replaceChildren(
  renderHeader(),
  h('main', { id: 'main' }, hero, philosophy, people, work, system, renderSecurity(), renderLab(), contact),
  renderFooter(),
);

// Scenes measure real layout, so motion starts after the DOM exists.
// Pinned scenes are created top to bottom so later triggers include earlier pin spacing.
initMotion();
initSmoothScroll();
animateHero(hero);
animatePhilosophy(philosophy);
animatePeople(people);
animateWork(work);
animateSystem(system);
magnetize($('.btn--magnetic', contact));
animateSite();
// Continuity is measured after every pin exists.
initRelay();
initVelocity();
initCursor();
initSound();

// Text metrics move pins, so measure once both type faces are in (or after 1.5s at most).
// Not on every 'loadingdone': extra unicode subsets load lazily while scrolling, and a
// full refresh mid-scroll would stall a frame.
const faces = Promise.all([
  document.fonts.load('500 1em "Geist Variable"'),
  document.fonts.load('400 1em "Geist Mono Variable"'),
]);
void Promise.race([faces, new Promise((r) => setTimeout(r, 1500))]).then(() => {
  ScrollTrigger.refresh();
  // Land on the deep-linked chapter or the position the visitor refreshed from.
  restorePosition((id) => {
    const el = document.getElementById(id);
    return el ? pageTop(el) : null;
  });
});
