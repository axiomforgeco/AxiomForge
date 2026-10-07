// Tactile UI sounds synthesised with Web Audio: no audio files. Off by default.
const STORAGE_KEY = 'primitives:sound';

let ctx: AudioContext | null = null;
let enabled = readPreference();

function readPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

export const isSoundOn = (): boolean => enabled;

export function setSound(on: boolean): void {
  enabled = on;
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    /* storage unavailable: preference lasts for this visit only */
  }
  if (on) void audio()?.resume();
}

function audio(): AudioContext | null {
  if (!ctx && typeof AudioContext !== 'undefined') ctx = new AudioContext();
  return ctx;
}

function blip(freq: number, duration: number, type: OscillatorType, gain: number): void {
  if (!enabled) return;
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + duration);
  amp.gain.setValueAtTime(gain, t);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration);
}

export const sound = {
  click: () => blip(1800, 0.035, 'square', 0.05),
  tick: () => blip(2600, 0.02, 'square', 0.025),
  impact: () => blip(140, 0.22, 'triangle', 0.35),
  success: () => {
    blip(880, 0.08, 'square', 0.04);
    setTimeout(() => blip(1320, 0.12, 'square', 0.04), 90);
  },
  error: () => blip(220, 0.18, 'sawtooth', 0.05),
};

/** One delegated listener gives every button and link a mechanical click. */
export function initSound(): void {
  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    if (target?.closest('button, a, [role="tab"]')) sound.click();
  });
}
