import './style.css';

import { magnetize } from './animations/contact';
import { animateHero } from './animations/hero';
import { animatePipeline } from './animations/pipeline';
import { animateProjects } from './animations/projects';
import { animateSite } from './animations/site';
import { animateTeam } from './animations/team';
import { $, h } from './lib/dom';
import { initMotion } from './lib/motion';
import { initSound } from './lib/sound';
import { renderContact } from './sections/contact';
import { renderFooter } from './sections/footer';
import { renderHeader } from './sections/header';
import { renderHero } from './sections/hero';
import { renderLab } from './sections/lab';
import { renderPipeline } from './sections/pipeline';
import { renderProjects } from './sections/projects';
import { renderSecurity } from './sections/security';
import { renderTeam } from './sections/team';

const app = $('#app');

const hero = renderHero();
const team = renderTeam();
const projects = renderProjects();
const pipeline = renderPipeline();
const contact = renderContact();

app.replaceChildren(
  renderHeader(),
  h(
    'main',
    { id: 'main' },
    hero,
    team.el,
    projects,
    pipeline,
    renderSecurity(),
    renderLab(),
    contact,
  ),
  renderFooter(),
);

// Motion must start after the DOM exists: scenes measure real layout.
initMotion();
animateHero(hero);
animateTeam(team);
animateProjects(projects);
animatePipeline(pipeline);
magnetize($('.btn--magnetic', contact));
animateSite();
initSound();
