import {
  brand,
  featuredProjects,
  GROUPS,
  initiativeAreas,
  operatingPortfolio,
  projectNo,
  projects,
  team,
  workProjects,
  type Project,
  type ProjectGroup,
  type Theme,
} from '../data/portfolioData';
import { extLink, h, maskLines, shapeSvg } from '../lib/dom';
import { createCaseStudy } from './caseStudy';

/** Each project's field becomes a section tone; the header and the wipes follow it. */
const TONE: Record<Theme, string> = { red: 'red', ink: 'dark', charcoal: 'dark', paper: 'light', cobalt: 'cobalt', yellow: 'yellow' };
/** The colour a section sits on before its own field is wiped in. */
const FROM: Record<string, string> = { red: 'red', dark: 'dark', light: 'ivory', cobalt: 'cobalt', yellow: 'yellow' };
const WIPES = ['circle', 'diagonal', 'inset'] as const;
/** Group fields: the long lists sit on one field each, so they read as one archive shelf. */
const GROUP_TONE: Record<ProjectGroup, string> = { client: 'light', flagship: 'dark', production: 'dark', software: 'cobalt', initiative: 'yellow' };

const pad = (n: number): string => String(n).padStart(2, '0');
const no = (p: Project): string => (p.group === 'initiative' ? 'Now' : projectNo(workProjects, p));
const inGroup = (g: ProjectGroup): Project[] => projects.filter((p) => p.group === g);

/** A labelled block; nothing renders for an empty field. */
function block(label: string, body: HTMLElement | null, cls = ''): HTMLElement | null {
  if (!body) return null;
  return h('section', { class: `entry__block ${cls}`.trim() }, h('h4', { class: 'meta entry__label' }, label), body);
}

const list = (items: string[], cls = 'entry__list'): HTMLElement | null =>
  items.length ? h('ul', { class: cls }, ...items.map((i) => h('li', {}, i))) : null;

/** The system as a chain of stations, the way the process line draws it. */
const flow = (steps: string[] | undefined): HTMLElement | null =>
  steps
    ? h(
        'ol',
        { class: 'flow', 'aria-label': `Architecture: ${steps.join(', then ')}` },
        ...steps.map((s) => h('li', { class: 'flow__step' }, h('span', { class: 'meta' }, s))),
      )
    : null;

function teamList(p: Project): HTMLElement | null {
  if (!p.contributors.length) return null;
  return h(
    'ul',
    { class: 'entry__team' },
    ...p.contributors.map((c) => {
      const m = team.find((t) => t.id === c.who)!;
      return h('li', {}, h('span', {}, `${m.first} ${m.last}`), h('span', { class: 'meta' }, `${m.role} — ${c.what}`));
    }),
  );
}

/** Open the full case, then either the real link or an honest status. */
function actions(p: Project): HTMLElement {
  return h(
    'div',
    { class: 'entry__actions' },
    h(
      'button',
      { class: 'link-btn', type: 'button', 'data-open': p.id, 'data-cursor': 'Open' },
      'Open case study',
      h('span', { class: 'visually-hidden' }, `: ${p.title}`),
      h('span', { class: 'link-btn__arrow', 'aria-hidden': 'true' }, '→'),
    ),
    p.url ? extLink(p.url, 'Visit project', p.title) : h('p', { class: 'meta entry__status' }, p.status),
  );
}

function sizedTitle(p: Project, tag: 'h3', cls: string): HTMLElement {
  const title = maskLines(tag, p.lines, { id: `entry-${p.id}`, class: `display ${cls}` });
  // Sized by its longest line, so a long name never runs into the geometry.
  title.style.setProperty('--chars', String(Math.max(...p.lines.map((l) => l.length))));
  return title;
}

function facts(p: Project): string {
  return [p.client, `${p.category[0]} / ${p.category[1]}`, p.year, p.status].filter(Boolean).join('  ·  ');
}

/** Client work and flagship engineering: a full-frame entry with its own colour field. */
function entry(p: Project, i: number, prevTone: string): HTMLElement {
  const tone = TONE[p.theme];
  const flagship = p.group === 'flagship';
  return h(
    'article',
    {
      id: `p-${p.id}`,
      // Layouts alternate so the archive reads as a sequence, not a grid of cards.
      class: `section entry entry--${i % 2 ? 'b' : 'a'} entry--${p.shape}${flagship ? ' entry--flagship' : ''}`,
      'data-tone': tone,
      'data-from': FROM[prevTone] ?? 'ivory',
      'data-wipe': WIPES[i % WIPES.length]!,
      'aria-labelledby': `entry-${p.id}`,
    },
    h('div', { class: 'plane', 'aria-hidden': 'true' }),
    h(
      'div',
      { class: 'container entry__inner' },
      h(
        'header',
        { class: 'entry__head' },
        h('p', { class: 'meta entry__no' }, `${no(p)} / ${pad(workProjects.length)}`, p.featured ? h('span', { class: 'entry__flag' }, 'Featured') : null),
        h('p', { class: 'meta entry__facts' }, facts(p)),
        sizedTitle(p, 'h3', 'entry__title'),
        h('p', { class: 'entry__summary lead' }, p.summary),
      ),
      h('div', { class: 'entry__geo', 'aria-hidden': 'true', 'data-cursor-shape': p.shape }, shapeSvg(p.shape, p.accent)),
      flagship && p.flow ? h('div', { class: 'entry__flow' }, block('Architecture', flow(p.flow))) : null,
      h(
        'div',
        { class: 'entry__story' },
        block('What it was', h('p', {}, p.what)),
        block('The problem', h('p', {}, p.problem)),
        block('How it is used', h('p', {}, p.usage)),
      ),
      h(
        'div',
        { class: 'entry__facts-row' },
        block('What we built', list(p.built)),
        block('Technology', list(p.tech, 'entry__tech')),
        block('Team', teamList(p)),
        block('Outcome', p.outcome ? h('p', {}, p.outcome) : null),
        actions(p),
      ),
    ),
  );
}

/** Production implementations and software: a dense editorial row on its group's field. */
function row(p: Project): HTMLElement {
  return h(
    'article',
    { id: `p-${p.id}`, class: `row-entry row-entry--${p.shape}`, 'aria-labelledby': `entry-${p.id}` },
    h(
      'header',
      { class: 'row-entry__head' },
      h('p', { class: 'meta' }, `${no(p)} / ${pad(workProjects.length)}`),
      h('span', { class: 'row-entry__geo', 'aria-hidden': 'true' }, shapeSvg(p.shape, p.accent)),
      sizedTitle(p, 'h3', 'row-entry__title'),
      h('p', { class: 'meta row-entry__facts' }, facts(p)),
      actions(p),
    ),
    h(
      'div',
      { class: 'row-entry__body' },
      block('What it was', h('p', {}, p.what)),
      block('The problem', h('p', {}, p.problem)),
      block('How it is used', h('p', {}, p.usage)),
      block('Architecture', flow(p.flow), 'row-entry__wide'),
      block('Technology', list(p.tech, 'entry__tech'), 'row-entry__wide'),
      block('Team', teamList(p)),
      block('Outcome', p.outcome ? h('p', {}, p.outcome) : null),
    ),
  );
}

/** A shelf title, sized by its longest word so a long word never runs off a phone. */
function shelfTitle(id: string, text: string): HTMLElement {
  const title = h('h2', { class: 'display archive__group-title', id }, text);
  title.style.setProperty('--chars', String(Math.max(...text.split(' ').map((w) => w.length))));
  return title;
}

function groupHead(g: (typeof GROUPS)[number], index: number, count: string): HTMLElement {
  return h(
    'header',
    { class: 'container archive__group-head' },
    h('p', { class: 'meta' }, `${pad(index + 1)} / ${pad(GROUPS.length + 1)}  ·  ${count}`),
    shelfTitle(`group-${g.id}`, g.title),
    h('p', { class: 'archive__group-note' }, g.note),
  );
}

function groupSection(g: (typeof GROUPS)[number], index: number): HTMLElement {
  const items = inGroup(g.id);
  const tone = GROUP_TONE[g.id];
  const count = g.id === 'initiative' ? 'In progress' : `${pad(items.length)} ${items.length === 1 ? 'project' : 'projects'}`;
  const attrs = {
    id: `g-${g.id}`,
    class: `section archive__group archive__group--${g.id}`,
    'data-tone': tone,
    'aria-labelledby': `group-${g.id}`,
  };

  if (g.id === 'client' || g.id === 'flagship') {
    let prev = tone;
    const entries = items.map((p, i) => {
      const e = entry(p, i, prev);
      prev = TONE[p.theme];
      return e;
    });
    return h('section', attrs, groupHead(g, index, count), ...entries);
  }

  if (g.id === 'initiative') {
    const p = items[0]!;
    return h(
      'section',
      attrs,
      groupHead(g, index, count),
      h(
        'article',
        { id: `p-${p.id}`, class: 'container initiative', 'aria-labelledby': `entry-${p.id}` },
        h('p', { class: 'meta initiative__label' }, 'Current initiative · not a completed project'),
        sizedTitle(p, 'h3', 'initiative__title'),
        h('p', { class: 'lead initiative__summary' }, p.summary),
        block('Service direction', flow(p.flow), 'initiative__flow'),
        h(
          'div',
          { class: 'entry__story' },
          block('What it is', h('p', {}, p.what)),
          block('The problem', h('p', {}, p.problem)),
          block('How it is used', h('p', {}, p.usage)),
        ),
        h('div', { class: 'initiative__areas' }, ...initiativeAreas.map((a) => block(a.title, list(a.items)))),
      ),
    );
  }

  return h('section', attrs, groupHead(g, index, count), h('div', { class: 'container row-list' }, ...items.map(row)));
}

/** Environments run in production: a statement and the domains, never one project each. */
function operating(): HTMLElement {
  const o = operatingPortfolio;
  return h(
    'section',
    { id: 'g-operating', class: 'section archive__group archive__group--operating', 'data-tone': 'light', 'aria-labelledby': 'group-operating' },
    h(
      'header',
      { class: 'container archive__group-head' },
      h('p', { class: 'meta' }, `${pad(GROUPS.length + 1)} / ${pad(GROUPS.length + 1)}  ·  Live environments`),
      shelfTitle('group-operating', 'Operating portfolio'),
      h('p', { class: 'archive__group-note' }, o.statement),
    ),
    h(
      'div',
      { class: 'container operating' },
      h('p', { class: 'numeral operating__count', 'aria-hidden': 'true' }, o.environments),
      h(
        'div',
        { class: 'operating__groups' },
        ...o.groups.map((g) => block(g.title, h('ul', { class: 'operating__domains' }, ...g.domains.map((d) => h('li', {}, d))))),
        h('p', { class: 'operating__more' }, o.more),
      ),
    ),
  );
}

/**
 * The Projects page: the whole archive in shelves (client work, flagship engineering,
 * production implementations, software, the current initiative, the operating
 * portfolio). One data list feeds it and the homepage's featured three.
 */
export function renderArchive(): HTMLElement {
  const caseStudy = createCaseStudy(projects);
  document.body.append(caseStudy.dialog);

  const index = h(
    'nav',
    { class: 'archive__index', 'aria-label': 'Project index' },
    ...GROUPS.map((g) =>
      h(
        'div',
        { class: 'archive__index-group' },
        h('p', { class: 'meta archive__index-head' }, h('a', { href: `#g-${g.id}` }, g.title)),
        h(
          'ol',
          {},
          ...inGroup(g.id).map((p) =>
            h(
              'li',
              {},
              h(
                'a',
                { href: `#p-${p.id}`, 'data-cursor': 'Go' },
                h('span', { class: 'meta' }, no(p)),
                h('span', { class: 'archive__index-title' }, p.title),
                h('span', { class: 'meta archive__index-cat' }, `${p.category[0]} / ${p.category[1]}`),
                h('span', { class: 'meta archive__index-status' }, p.featured ? 'Featured' : p.status),
              ),
            ),
          ),
        ),
      ),
    ),
    h('p', { class: 'meta archive__index-head' }, h('a', { href: '#g-operating' }, 'Operating portfolio')),
  );

  const hero = h(
    'section',
    { id: 'top', class: 'section archive__hero', 'aria-labelledby': 'archive-title' },
    h(
      'div',
      { class: 'container' },
      h('p', { class: 'chapter-label meta' }, h('span', {}, brand.name), h('span', { class: 'chapter-label__rule', 'aria-hidden': 'true' }), h('span', {}, 'Projects')),
      maskLines('h1', ['Projects'], { id: 'archive-title', class: 'display archive__title' }),
      h(
        'div',
        { class: 'archive__intro' },
        h(
          'p',
          { class: 'lead' },
          'Client work, production systems, infrastructure and software, each as a short case study: what it was, the problem behind it, how it is used and what was built.',
        ),
        // Counted from the data, never typed in.
        h(
          'p',
          { class: 'meta archive__count' },
          `${pad(workProjects.length)} projects / ${pad(featuredProjects.length)} featured / ${pad(inGroup('initiative').length)} current initiative`,
        ),
      ),
      index,
    ),
  );

  const main = h('main', { id: 'main', class: 'archive' }, hero, ...GROUPS.map(groupSection), operating());
  main.addEventListener('click', (event) => {
    const btn = (event.target as Element).closest<HTMLElement>('[data-open]');
    if (!btn) return;
    const geo = btn.closest('.entry, .row-entry, .initiative')?.querySelector('svg') ?? btn;
    caseStudy.open(btn.dataset.open ?? '', geo);
  });
  return main;
}
