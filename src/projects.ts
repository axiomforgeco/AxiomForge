import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './style.css';

import { animateArchive } from './animations/archive';
import { animateSite } from './animations/site';
import { initCursor } from './lib/cursor';
import { $ } from './lib/dom';
import { initMotion, pageTop, ScrollTrigger } from './lib/motion';
import { initSmoothScroll, restorePosition } from './lib/scroll';
import { initSound } from './lib/sound';
import { renderArchive } from './sections/archive';
import { renderFooter, renderHeader } from './sections/chrome';

// The Projects page: the same header, scroll engine, cursor, wipes and end card as
// the homepage, around the full project archive.
const archive = renderArchive();
$('#app').replaceChildren(renderHeader('projects'), archive, renderFooter());

initMotion();
initSmoothScroll();
animateArchive(archive);
animateSite();
initCursor();
initSound();

const faces = Promise.all([
  document.fonts.load('500 1em "Geist Variable"'),
  document.fonts.load('400 1em "Geist Mono Variable"'),
]);
void Promise.race([faces, new Promise((r) => setTimeout(r, 1500))]).then(() => {
  ScrollTrigger.refresh();
  restorePosition((id) => {
    const el = document.getElementById(id);
    return el ? pageTop(el) : null;
  });
});
