import { team, type TeamMember } from '../data/portfolioData';
import { h, sectionHead, shapeSvg } from '../lib/dom';

export interface TeamSection {
  el: HTMLElement;
  setActive: (index: number) => void;
  onSelect: (handler: (index: number) => void) => void;
}

function renderPanel(member: TeamMember): HTMLElement[] {
  return [
    h(
      'div',
      { class: `team-panel__stat fill-${member.accent}` },
      h('p', { class: 'team-panel__stat-value' }, member.stat.value),
      h('p', { class: 'team-panel__stat-label' }, member.stat.label),
    ),
    h(
      'div',
      { class: 'team-panel__body' },
      h('p', { class: 'team-panel__kicker' }, `${member.letter} — ${member.role}`),
      h('h3', { class: 'team-panel__name' }, member.name),
      h('p', { class: 'team-panel__bio' }, member.bio),
      h(
        'ul',
        { class: 'team-panel__domains', 'aria-label': 'Domains' },
        ...member.domains.map((d) => h('li', {}, d)),
      ),
    ),
    h(
      'div',
      { class: 'team-panel__stack' },
      h('p', { class: 'mono-label' }, 'Core stack'),
      h('ul', { class: 'chips' }, ...member.stack.map((t) => h('li', { class: 'chip' }, t))),
    ),
  ];
}

export function renderTeam(): TeamSection {
  let selectHandler: (index: number) => void = () => {};
  let active = -1;

  const tabs = team.map((member, i) =>
    h(
      'button',
      {
        class: `team-tab team-tab--${member.accent}`,
        type: 'button',
        role: 'tab',
        id: `team-tab-${member.id}`,
        'aria-controls': 'team-panel',
        'aria-selected': 'false',
        tabindex: '-1',
        'data-index': i,
      },
      shapeSvg(member.shape, member.accent, 'team-tab__shape'),
      h('span', { class: 'team-tab__letter' }, member.letter),
      h('span', { class: 'team-tab__name' }, member.name),
      h('span', { class: 'team-tab__role' }, member.role),
    ),
  );

  const panel = h('div', {
    class: 'team-panel',
    id: 'team-panel',
    role: 'tabpanel',
    tabindex: '0',
  });

  const setActive = (index: number): void => {
    if (index === active) return;
    active = index;
    const member = team[index];
    if (!member) return;
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `team-tab-${member.id}`);
    panel.dataset.accent = member.accent;
    panel.replaceChildren(...renderPanel(member));
    panel.dispatchEvent(new CustomEvent('team:change', { bubbles: true }));
  };

  const tablist = h(
    'div',
    { class: 'team-tabs', role: 'tablist', 'aria-label': 'Team members' },
    ...tabs,
  );

  tablist.addEventListener('click', (event) => {
    const tab = (event.target as Element).closest<HTMLElement>('[role="tab"]');
    if (!tab) return;
    const index = Number(tab.dataset.index);
    setActive(index);
    selectHandler(index);
  });

  // WAI-ARIA tabs keyboard model: arrows, Home and End move focus and selection.
  tablist.addEventListener('keydown', (event) => {
    const keys: Record<string, (i: number) => number> = {
      ArrowRight: (i) => (i + 1) % tabs.length,
      ArrowDown: (i) => (i + 1) % tabs.length,
      ArrowLeft: (i) => (i - 1 + tabs.length) % tabs.length,
      ArrowUp: (i) => (i - 1 + tabs.length) % tabs.length,
      Home: () => 0,
      End: () => tabs.length - 1,
    };
    const move = keys[event.key];
    if (!move) return;
    event.preventDefault();
    const next = move(active);
    setActive(next);
    tabs[next]?.focus();
    selectHandler(next);
  });

  setActive(0);

  const el = h(
    'section',
    { id: 'team', class: 'section team', 'aria-labelledby': 'team-title' },
    h(
      'div',
      { class: 'container team__inner' },
      sectionHead(
        '01',
        'Team',
        'The Primitives',
        'Each of us is a shape: a square, a circle and a triangle. Select one to see what it builds.',
      ),
      tablist,
      panel,
      h('p', { class: 'team__hint mono-label', 'aria-hidden': 'true' }, 'Scroll or select ←→'),
    ),
  );

  return {
    el,
    setActive,
    onSelect: (handler) => {
      selectHandler = handler;
    },
  };
}
