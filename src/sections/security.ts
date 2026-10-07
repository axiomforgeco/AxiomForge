import { attacks, chapterCount, securityStages, type AttackVector } from '../data/portfolioData';
import { runThreat } from '../animations/security';
import { chapterLabel, h, maskLines, shapeSvg } from '../lib/dom';
import { sound } from '../lib/sound';

/** A visual metaphor, not a dashboard: a threat meets a structured system and is redirected. */
export function renderSecurity(): HTMLElement {
  let deflected = 0;
  let busy = false;

  const vectors = h(
    'fieldset',
    { class: 'vectors' },
    h('legend', { class: 'meta' }, 'Choose a threat'),
    ...attacks.map((a, i) =>
      h(
        'label',
        { class: 'vector', 'data-cursor': 'Select' },
        h('input', { type: 'radio', name: 'threat', value: a.id, checked: i === 0 }),
        h('span', { class: 'vector__no meta' }, String(i + 1).padStart(2, '0')),
        h('span', { class: 'vector__label' }, a.label),
      ),
    ),
  );

  const run = h('button', { class: 'btn', type: 'button', 'data-cursor': 'Run' }, 'Run simulation');
  const count = h('span', { class: 'numeral security__count-value' }, '00');

  const stage = h(
    'div',
    { class: 'security__stage', 'aria-hidden': 'true' },
    h('span', { class: 'security__ground' }),
    h('div', { class: 'threat', 'data-cursor-shape': 'triangle' }, shapeSvg('triangle', 'red')),
    h('div', { class: 'core' }, shapeSvg('circle', 'yellow')),
    h('div', { class: 'defense', 'data-cursor-shape': 'square' }),
  );

  const states = securityStages.map((label, i) =>
    h(
      'li',
      { class: 'state', 'data-state': i },
      h('span', { class: 'state__mark', 'aria-hidden': 'true' }),
      h('p', { class: 'state__label meta' }, `${String(i + 1).padStart(2, '0')} ${label}`),
      h('p', { class: 'state__text' }, '—'),
    ),
  );
  const stateList = h('ol', { class: 'security__states', 'aria-live': 'polite' }, ...states);

  const selected = (): AttackVector =>
    attacks.find((a) => a.id === vectors.querySelector<HTMLInputElement>('input:checked')?.value) ?? attacks[0]!;

  const reset = (): void => {
    stateList.classList.remove('is-told');
    states.forEach((st) => {
      st.classList.remove('is-on');
      st.querySelector('.state__text')!.textContent = '—';
    });
  };

  run.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    run.disabled = true;
    reset();
    const attack = selected();
    void runThreat(stage, (i) => {
      const st = states[i];
      if (!st) return;
      st.classList.add('is-on');
      st.querySelector('.state__text')!.textContent = attack.stages[i] ?? '';
      if (i === 3) stateList.classList.add('is-told');
      if (i === 1) sound.impact();
      else sound.tick();
    }).then(() => {
      deflected += 1;
      count.textContent = String(deflected).padStart(2, '0');
      busy = false;
      run.disabled = false;
    });
  });

  return h(
    'section',
    { id: 'security', class: 'section security', 'aria-labelledby': 'security-title' },
    h(
      'div',
      { class: 'container' },
      chapterLabel('security', 'Security', chapterCount),
      h(
        'div',
        { class: 'security__head' },
        maskLines('h2', ['Threat,', 'redirected.'], { id: 'security-title', class: 'display security__title' }),
        h(
          'p',
          { class: 'lead' },
          'A safe, in-browser simulation of how our systems answer an attack: detect it, understand it, send it somewhere harmless.',
        ),
      ),
      h(
        'div',
        { class: 'security__grid' },
        h(
          'div',
          { class: 'security__controls' },
          vectors,
          run,
          h('p', { class: 'security__count' }, h('span', { class: 'meta' }, 'Redirected'), count),
        ),
        stage,
        stateList,
      ),
    ),
  );
}
