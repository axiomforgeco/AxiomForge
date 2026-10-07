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
import { initMotion } from './lib/motion';
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
