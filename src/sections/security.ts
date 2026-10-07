import { attacks, type AttackVector } from '../data/portfolioData';
import { h, sectionHead, shapeSvg } from '../lib/dom';
import { strike } from '../animations/security';
import { isReduced } from '../lib/motion';
import { sound } from '../lib/sound';

function timestamp(): string {
  return new Date().toISOString().slice(11, 23);
}

export function renderSecurity(): HTMLElement {
  let deflected = 0;
  let busy = false;

  const options = attacks.map((attack, i) =>
    h(
      'label',
      { class: 'vector' },
      h('input', {
        type: 'radio',
        name: 'attack-vector',
        value: attack.id,
        checked: i === 0,
        class: 'vector__input',
      }),
      h('span', { class: 'vector__short' }, attack.short),
      h('span', { class: 'vector__label' }, attack.label),
    ),
  );

  const launch = h('button', { class: 'btn btn--red launch', type: 'button' }, 'Launch attack ▸');
  const counter = h('span', { class: 'sec-stats__value' }, '000');
  const shieldState = h('span', { class: 'sec-stats__value', 'data-shield-state': '' }, 'ARMED');
  const payload = h('p', { class: 'arena__payload' }, attacks[0]?.payload ?? '');
  const log = h('ol', {
    class: 'terminal__log',
    'aria-live': 'polite',
    'aria-label': 'Defense log',
  });

  const appendLog = (line: string, final: boolean): void => {
    const row = h(
      'li',
      { class: final ? 'terminal__line terminal__line--ok' : 'terminal__line' },
      h('span', { class: 'terminal__time' }, timestamp()),
      h('span', {}, final ? `✓ ${line}` : `» ${line}`),
    );
    log.append(row);
    while (log.children.length > 14) log.firstElementChild?.remove();
    log.scrollTop = log.scrollHeight;
  };

  const selected = (): AttackVector =>
    attacks.find(
      (a) =>
        a.id ===
        (document.querySelector<HTMLInputElement>('input[name="attack-vector"]:checked')?.value ??
          ''),
    ) ?? attacks[0]!;

  const fieldset = h(
    'fieldset',
    { class: 'vectors' },
    h('legend', { class: 'mono-label' }, 'Select attack vector'),
    ...options,
  );
  fieldset.addEventListener('change', () => {
    payload.textContent = selected().payload;
  });

  const arena = h(
    'div',
    { class: 'arena', 'aria-hidden': 'true' },
    h('span', { class: 'arena__grid' }),
    h('div', { class: 'arena__attacker' }, payload, shapeSvg('triangle', 'red', 'arena__triangle')),
    h('div', { class: 'arena__shield' }, h('span', { class: 'arena__shield-label' }, 'WAF')),
    h('div', { class: 'arena__core' }, h('span', {}, 'CORE')),
    h('span', { class: 'arena__flash' }),
  );

  launch.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    launch.disabled = true;
    const attack = selected();
    payload.textContent = attack.payload;
    shieldState.textContent = 'ENGAGED';
    appendLog(`ATTACK   ${attack.label.toUpperCase()} launched`, false);

    void strike(arena, {
      onImpact: () => {
        sound.impact();
        attack.logs.slice(0, -1).forEach((line, i) => {
          window.setTimeout(() => appendLog(line, false), isReduced() ? 0 : i * 160);
        });
      },
    }).then(() => {
      sound.success();
      appendLog(attack.logs.at(-1) ?? 'DEFLECTED', true);
      deflected += 1;
      counter.textContent = String(deflected).padStart(3, '0');
      shieldState.textContent = 'HOLDING';
      busy = false;
      launch.disabled = false;
    });
  });

  appendLog('SHIELD   online · WAF rules loaded · CSP strict', false);

  return h(
    'section',
    { id: 'security', class: 'section security', 'aria-labelledby': 'security-title' },
    h(
      'div',
      { class: 'container security__inner' },
      sectionHead(
        '04',
        'Security',
        'Attack vs. Defense',
        'Pick a vector and fire it at our shield. This is a safe in-browser simulation of the controls we ship.',
      ),
      h(
        'div',
        { class: 'security__grid' },
        h(
          'div',
          { class: 'security__controls' },
          fieldset,
          launch,
          h(
            'dl',
            { class: 'sec-stats' },
            h('div', {}, h('dt', {}, 'Threats deflected'), h('dd', {}, counter)),
            h('div', {}, h('dt', {}, 'Shield'), h('dd', {}, shieldState)),
            h('div', {}, h('dt', {}, 'Breaches'), h('dd', {}, h('span', { class: 'sec-stats__value' }, '000'))),
          ),
        ),
        h(
          'div',
          { class: 'security__visual' },
          arena,
          h(
            'div',
            { class: 'terminal' },
            h(
              'p',
              { class: 'terminal__bar' },
              h('span', {}, 'defense.log'),
              h('span', {}, 'tail -f'),
            ),
            log,
          ),
        ),
      ),
    ),
  );
}
