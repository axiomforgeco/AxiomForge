import { projects, type Project } from '../data/portfolioData';
import { h, onFill, sectionHead, shapeSvg } from '../lib/dom';
import { gsap, isReduced } from '../lib/motion';

function metricList(project: Project, className: string): HTMLElement {
  return h(
    'dl',
    { class: className },
    ...project.metrics.map((m) =>
      h('div', {}, h('dt', {}, m.label), h('dd', {}, m.value)),
    ),
  );
}

function createModal(): { dialog: HTMLDialogElement; open: (project: Project) => void } {
  const content = h('div', { class: 'modal__content' });
  const closeBtn = h(
    'button',
    { class: 'modal__close btn btn--small', type: 'button', 'aria-label': 'Close case file' },
    'Close ✕',
  );
  const dialog = h(
    'dialog',
    { class: 'modal', 'aria-labelledby': 'modal-title' },
    closeBtn,
    content,
  );

  closeBtn.addEventListener('click', () => dialog.close());
  // A click on the backdrop lands on the <dialog> itself, not its content.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  const open = (project: Project): void => {
    dialog.dataset.accent = project.accent;
    content.replaceChildren(
      h(
        'header',
        { class: `modal__head fill-${project.accent}` },
        shapeSvg(project.shape, onFill(project.accent), 'modal__shape'),
        h('p', { class: 'mono-label' }, `Case file ${project.code} — ${project.category}`),
        h('h2', { id: 'modal-title', class: 'modal__title' }, project.name),
        h('p', { class: 'modal__tagline' }, project.tagline),
      ),
      h(
        'div',
        { class: 'modal__body' },
        h(
          'section',
          { class: 'modal__block' },
          h('h3', { class: 'mono-label' }, '01 / Architectural challenge'),
          h('p', {}, project.challenge),
        ),
        h(
          'section',
          { class: 'modal__block' },
          h('h3', { class: 'mono-label' }, '02 / Solution'),
          h('p', {}, project.solution),
        ),
        h(
          'section',
          { class: 'modal__block modal__block--metrics' },
          h('h3', { class: 'mono-label' }, '03 / Signals'),
          metricList(project, 'metrics metrics--large'),
          h('ul', { class: 'chips' }, ...project.tags.map((t) => h('li', { class: 'chip' }, t))),
        ),
        h(
          'section',
          { class: 'modal__block modal__block--code' },
          h('h3', { class: 'mono-label' }, `04 / Code preview — ${project.codeTitle}`),
          h('pre', { class: 'code', tabindex: '0' }, h('code', {}, project.snippet)),
        ),
      ),
    );
    dialog.showModal();
    if (!isReduced()) {
      gsap.from(dialog, { y: 40, autoAlpha: 0, duration: 0.35, ease: 'power3.out' });
    }
  };

  return { dialog, open };
}

export function renderProjects(): HTMLElement {
  const modal = createModal();

  const cards = projects.map((project) =>
    h(
      'article',
      { class: `project-card fill-${project.accent}`, 'aria-labelledby': `project-${project.id}` },
      h(
        'div',
        { class: 'project-card__top' },
        h('span', { class: 'project-card__code' }, project.code),
        shapeSvg(project.shape, onFill(project.accent), 'project-card__shape'),
      ),
      h('p', { class: 'project-card__category mono-label' }, project.category),
      h('h3', { class: 'project-card__name', id: `project-${project.id}` }, project.name),
      h('p', { class: 'project-card__tagline' }, project.tagline),
      metricList(project, 'metrics'),
      h('ul', { class: 'chips chips--on-fill' }, ...project.tags.map((t) => h('li', { class: 'chip' }, t))),
      h(
        'button',
        { class: 'btn btn--paper project-card__open', type: 'button', 'data-project': project.id },
        'Open case file →',
        h('span', { class: 'visually-hidden' }, `: ${project.name}`),
      ),
    ),
  );

  const track = h('div', { class: 'projects__track' }, ...cards);
  track.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLElement>('[data-project]');
    const project = projects.find((p) => p.id === button?.dataset.project);
    if (project) modal.open(project);
  });

  return h(
    'section',
    { id: 'work', class: 'section projects', 'aria-labelledby': 'work-title' },
    h(
      'div',
      { class: 'container projects__head' },
      sectionHead(
        '02',
        'Work',
        'Proof of Work',
        'Four systems, four disciplines. Open a case file for the challenge, the solution and the code.',
      ),
      h(
        'p',
        { class: 'projects__counter numeral', 'aria-hidden': 'true' },
        h('span', { 'data-project-index': '' }, '01'),
        h('span', { class: 'projects__counter-total' }, ` / 0${projects.length}`),
      ),
    ),
    h('div', { class: 'projects__viewport' }, track),
    modal.dialog,
  );
}
