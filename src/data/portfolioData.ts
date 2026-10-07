// All site content. Sections render from these objects.
// Content rule: no invented metrics, clients or people. Anything still unconfirmed is marked TODO(content).

export type Accent = 'blue' | 'yellow' | 'red' | 'ink';
export type Shape = 'square' | 'circle' | 'triangle';
export type Theme = 'paper' | 'ink' | 'charcoal';

export const brand = {
  name: 'ORTHO', // Proposed studio name (from "orthogonal"). TODO(content): confirm or replace.
  descriptor: 'Digital Systems Studio',
  email: 'hello@ortho.studio', // TODO(content): replace with the team's real inbox.
  availability: 'Available for select projects',
  // Only links with a URL are rendered. TODO(content): add real profiles.
  socials: [
    { label: 'GitHub', url: '' },
    { label: 'LinkedIn', url: '' },
    { label: 'Instagram', url: '' },
  ],
} as const;

/** Chapters, in page order. `nav` marks the ones listed in the header. */
export const chapters = [
  { id: 'top', label: 'Intro', nav: false },
  { id: 'philosophy', label: 'Philosophy', nav: false },
  { id: 'people', label: 'People', nav: false },
  { id: 'work', label: 'Work', nav: true },
  { id: 'system', label: 'System', nav: true },
  { id: 'security', label: 'Security', nav: false },
  { id: 'lab', label: 'Lab', nav: true },
  { id: 'contact', label: 'Contact', nav: true },
] as const;

export const chapterCount = String(chapters.length).padStart(2, '0');
export const chapterNo = (id: string): string =>
  String(chapters.findIndex((c) => c.id === id) + 1).padStart(2, '0');

export const philosophy = {
  statement:
    'Three disciplines working as one system. We design the interface, engineer what runs behind it, and attack our own work before anyone else can.',
  principles: [
    { no: '01', title: 'Precision', shape: 'square', text: 'Every element earns its place. Nothing ships because it looks clever.' },
    { no: '02', title: 'Resilience', shape: 'circle', text: 'Systems designed to fail safely and recover predictably.' },
    { no: '03', title: 'Security', shape: 'triangle', text: 'Threat modelling starts at the first sketch, not the last sprint.' },
  ] satisfies { no: string; title: string; shape: Shape; text: string }[],
};

export interface TeamMember {
  id: string;
  index: string;
  letter: string;
  name: string; // TODO(content): real names. Empty names render as the role only.
  lines: [string, string];
  role: string;
  shape: Shape;
  accent: Accent;
  statement: string;
  disciplines: [string, string, string];
}

// Order matters: the hero circle hands off to the first shape, and the last
// shape (triangle) hands off to the first project's geometry.
export const team: TeamMember[] = [
  {
    id: 'b',
    index: '01',
    letter: 'B',
    name: '',
    lines: ['Data', 'Cloud'],
    role: 'Data + Cloud + Payments',
    shape: 'circle',
    accent: 'yellow',
    statement: 'Owns the data layer, hosting, secrets and payment integrations.',
    disciplines: ['PostgreSQL', 'Cloud & deploys', 'Payments'],
  },
  {
    id: 'a',
    index: '02',
    letter: 'A',
    name: '',
    lines: ['Backend', 'Systems'],
    role: 'Backend + Testing',
    shape: 'square',
    accent: 'blue',
    statement: 'Builds the APIs and business logic, and the tests that keep them honest.',
    disciplines: ['REST APIs', 'Validation', 'Automated testing'],
  },
  {
    id: 'c',
    index: '03',
    letter: 'C',
    name: '',
    lines: ['Frontend', 'Security'],
    role: 'Frontend + Security',
    shape: 'triangle',
    accent: 'red',
    statement: 'Builds the interface from scratch, then attacks everything before release.',
    disciplines: ['Interfaces', 'Motion', 'Security review'],
  },
];

export interface Project {
  id: string;
  index: string;
  name: string;
  category: [string, string];
  shape: Shape;
  accent: Accent;
  theme: Theme;
  year: string;
  summary: string;
  challenge: string;
  approach: string;
  system: string;
  result: string;
  stack: string[];
}

// TODO(content): REVENANT, WRAITH and RAVEN copy below is qualitative, written from each
// project's one-line positioning. Replace with confirmed details, stack and links.
export const projects: Project[] = [
  {
    id: 'revenant',
    index: '01',
    name: 'Revenant',
    category: ['AI Red Teaming', 'System'],
    shape: 'triangle',
    accent: 'red',
    theme: 'ink',
    year: '',
    summary: 'Security orchestration for adversarial testing of AI systems.',
    challenge: 'Adversarial testing of AI systems is slow, manual and hard to repeat.',
    approach: 'Treat red-team exercises as orchestrated campaigns instead of one-off sessions.',
    system: 'An orchestration layer that runs attack scenarios and gathers findings in one place.',
    result: 'Designed to make AI red teaming repeatable and reviewable.',
    stack: [],
  },
  {
    id: 'wraith',
    index: '02',
    name: 'Wraith',
    category: ['Authorized Security', 'CTF Platform'],
    shape: 'square',
    accent: 'blue',
    theme: 'paper',
    year: '',
    summary: 'An authorized security and capture-the-flag platform.',
    challenge: 'Practising offensive security needs realistic targets that are legal to attack.',
    approach: 'Purpose-built challenges inside an authorized, isolated environment.',
    system: 'Challenges are separated from each other and from the platform that hosts them.',
    result: 'Designed for safe, hands-on security practice.',
    stack: [],
  },
  {
    id: 'raven',
    index: '03',
    name: 'Raven',
    category: ['OSINT', 'Intelligence'],
    shape: 'circle',
    accent: 'yellow',
    theme: 'charcoal',
    year: '',
    summary: 'An open-source intelligence project.',
    challenge: 'Public information is scattered across many sources and formats.',
    approach: 'Collect and connect open sources into a single investigative view.',
    system: 'Sources feed a common model, so findings can be traced back to where they came from.',
    result: 'Designed to make open-source research faster to organise.',
    stack: [],
  },
  {
    id: 'ortho',
    index: '04',
    name: 'Ortho',
    category: ['Portfolio', 'Motion System'],
    shape: 'square',
    accent: 'ink',
    theme: 'paper',
    year: '2026',
    summary: 'This site. A scroll-driven portfolio built without a UI framework.',
    challenge: 'Show three disciplines as one team, without a template and without hiding content behind motion.',
    approach: 'Plain TypeScript, CSS custom properties and GSAP with ScrollTrigger.',
    system: 'Every scene has full, compact and reduced-motion versions, switched live by media queries.',
    result: 'Keyboard-accessible throughout, with a reduced-motion version of every scene.',
    stack: ['Vite', 'TypeScript', 'GSAP', 'ScrollTrigger', 'CSS'],
  },
];

export interface ProcessStage {
  word: string;
  shape: Shape;
  accent: Accent;
  text: string;
  input: string;
  output: string;
}

export const processStages: ProcessStage[] = [
  {
    word: 'Discover',
    shape: 'circle',
    accent: 'yellow',
    text: 'Requirements, data flows and a threat model before any code.',
    input: 'Brief',
    output: 'Spec + threat model',
  },
  {
    word: 'Build',
    shape: 'square',
    accent: 'blue',
    text: 'Typed services, interfaces and infrastructure as code.',
    input: 'Spec',
    output: 'Working system',
  },
  {
    word: 'Break',
    shape: 'triangle',
    accent: 'red',
    text: 'Tests, load and adversarial review against our own work.',
    input: 'System',
    output: 'Findings',
  },
  {
    word: 'Defend',
    shape: 'square',
    accent: 'ink',
    text: 'Fixes verified, monitoring in place, release signed off.',
    input: 'Findings',
    output: 'Release',
  },
];

export interface AttackVector {
  id: string;
  label: string;
  stages: [string, string, string, string]; // threat, detection, analysis, response
}

export const securityStages = ['Threat', 'Detection', 'Analysis', 'Response'] as const;

export const attacks: AttackVector[] = [
  {
    id: 'sqli',
    label: 'SQL Injection',
    stages: [
      `' OR 1=1 --`,
      'Input outside the expected grammar',
      'Bound as a parameter, never executed as SQL',
      'Rejected. Nothing executed.',
    ],
  },
  {
    id: 'xss',
    label: 'Cross-Site Scripting',
    stages: [
      '<img src=x onerror=…>',
      'Markup in a text-only field',
      'Encoded on output, inline script blocked by CSP',
      'Rendered as text. Nothing ran.',
    ],
  },
  {
    id: 'replay',
    label: 'Replay',
    stages: [
      'Captured request, sent again',
      'Nonce already used',
      'Timestamp outside the signed window',
      'Rejected. Session rotated.',
    ],
  },
];

export interface ProbeEndpoint {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  latencyMs: [number, number];
  body: Record<string, unknown>;
}

// A mock API that runs in the browser. Values are illustrative.
export const probeEndpoints: ProbeEndpoint[] = [
  {
    id: 'health',
    method: 'GET',
    path: '/v1/health',
    latencyMs: [0.8, 2.2],
    body: { status: 'ok' },
  },
  {
    id: 'projects',
    method: 'GET',
    path: '/v1/projects',
    latencyMs: [2.4, 6.5],
    body: { count: 4, items: ['revenant', 'wraith', 'raven', 'ortho'] },
  },
  {
    id: 'echo',
    method: 'POST',
    path: '/v1/echo',
    latencyMs: [3.1, 8.9],
    body: { received: { message: 'hello' }, validated: true },
  },
];

/** Stripe's published test card numbers. The simulator accepts nothing else. */
export const testCards: Record<string, { outcome: 'succeeded' | 'declined'; reason?: string }> = {
  '4242424242424242': { outcome: 'succeeded' },
  '4000000000000002': { outcome: 'declined', reason: 'card_declined' },
  '4000000000009995': { outcome: 'declined', reason: 'insufficient_funds' },
};
