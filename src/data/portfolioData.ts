// All site content lives here. Sections render from these objects, so copy edits never touch layout code.

export type Accent = 'blue' | 'yellow' | 'red' | 'ink';
export type Shape = 'square' | 'circle' | 'triangle';

export interface Stat {
  value: string;
  label: string;
}

export const brand = {
  name: 'PRIMITIVES',
  descriptor: 'Engineering Collective',
  email: 'hello@primitives.dev', // TODO(content): replace with the team's real inbox.
  manifesto: ['WE DESIGN.', 'WE BUILD.', 'WE TEST.', 'WE SECURE.', 'WE SHIP.'],
} as const;

export const navLinks = [
  { id: 'team', label: 'Team' },
  { id: 'work', label: 'Work' },
  { id: 'process', label: 'Process' },
  { id: 'security', label: 'Security' },
  { id: 'lab', label: 'Lab' },
  { id: 'contact', label: 'Contact' },
] as const;

export interface TeamMember {
  id: string;
  letter: string;
  name: string;
  shape: Shape;
  accent: Accent;
  role: string;
  bio: string;
  domains: string[];
  stat: Stat;
  stack: string[];
}

export const team: TeamMember[] = [
  {
    id: 'marcus',
    letter: 'A',
    name: 'Marcus Chen',
    shape: 'square',
    accent: 'blue',
    role: 'Systems Architect & Backend Lead',
    bio: 'Designs backends that keep their promises under load: jobs that run exactly once, APIs that are safe to retry, and services that degrade instead of collapsing.',
    domains: ['Distributed engines', 'Idempotency', 'Microservices'],
    stat: { value: '99.999%', label: 'SLA' },
    stack: ['Go', 'TypeScript', 'PostgreSQL', 'Kafka', 'gRPC', 'Redis'],
  },
  {
    id: 'elena',
    letter: 'B',
    name: 'Elena Rostova',
    shape: 'circle',
    accent: 'yellow',
    role: 'Cloud & Data Infrastructure Lead',
    bio: 'Builds the data plane: event streams, metering pipelines and cloud topologies that scale sideways and bill to the cent.',
    domains: ['Cloud topology', 'Stream telemetry', 'Usage billing'],
    stat: { value: '1.2B+', label: 'Events / day' },
    stack: ['AWS', 'Terraform', 'Kubernetes', 'ClickHouse', 'Kafka', 'dbt'],
  },
  {
    id: 'darius',
    letter: 'C',
    name: 'Darius Vance',
    shape: 'triangle',
    accent: 'red',
    role: 'Frontend & Security Lead',
    bio: 'Builds interfaces that move with intent and systems that assume breach: kinetic UI, passwordless auth and adversarial review of everything we ship.',
    domains: ['GSAP kinetic UI', 'Zero-trust auth', 'Threat modeling'],
    stat: { value: '0-Day', label: 'Proofs' },
    stack: ['TypeScript', 'GSAP', 'WebAuthn', 'CSP', 'Burp Suite', 'OWASP ZAP'],
  },
];

export interface Project {
  id: string;
  code: string;
  name: string;
  accent: Accent;
  shape: Shape;
  category: string;
  tagline: string;
  metrics: Stat[];
  tags: string[];
  challenge: string;
  solution: string;
  codeTitle: string;
  snippet: string;
}

export const projects: Project[] = [
  {
    id: 'kronos',
    code: '01',
    name: 'KRONOS ENGINE',
    accent: 'blue',
    shape: 'square',
    category: 'Distributed Systems',
    tagline: 'Distributed high-throughput job orchestrator.',
    metrics: [
      { value: '120k', label: 'req/s' },
      { value: '<2.4ms', label: 'latency' },
    ],
    tags: ['Go', 'Postgres', 'Kafka', 'gRPC'],
    challenge:
      'Fan out millions of scheduled jobs across a worker fleet without ever running a job twice, even when workers crash mid-task or the network partitions.',
    solution:
      'Lease-based claiming with fencing tokens, an idempotency ledger keyed per attempt, and bounded queues that push back instead of buffering forever.',
    codeTitle: 'worker/claim.ts',
    snippet: `const lease = await ledger.claim(job.id, { ttlMs: 30_000 });
if (!lease) return; // another worker owns this job

try {
  await run(job, { fencingToken: lease.token });
  await ledger.complete(job.id, lease.token);
} catch (err) {
  await ledger.release(job.id, lease.token, { retryIn: backoff(job) });
  throw err;
}`,
  },
  {
    id: 'aura',
    code: '02',
    name: 'AURA TELEMETRY',
    accent: 'yellow',
    shape: 'circle',
    category: 'Cloud & Data',
    tagline: 'Real-time cloud pipeline and metered billing.',
    metrics: [{ value: '1.4B', label: 'events/day' }],
    tags: ['Kafka', 'ClickHouse', 'Terraform', 'AWS'],
    challenge:
      'Turn a firehose of raw usage events into invoices customers trust, with late and duplicate events arriving from every region.',
    solution:
      'Deduplicated ingestion keyed on event IDs, event-time windows with watermarks for late data, and immutable usage rollups that invoices are derived from.',
    codeTitle: 'rollups/hourly_usage.sql',
    snippet: `INSERT INTO usage_hourly
SELECT tenant_id,
       toStartOfHour(event_time) AS hour,
       sum(units)                 AS units
FROM   events FINAL               -- dedupe on event_id
WHERE  event_time >= {from:DateTime}
  AND  event_time <  {to:DateTime}
GROUP  BY tenant_id, hour;`,
  },
  {
    id: 'aegis',
    code: '03',
    name: 'AEGIS SECURITY',
    accent: 'red',
    shape: 'triangle',
    category: 'Security',
    tagline: 'Zero-trust WebAuthn and a hardened WAF gateway.',
    metrics: [{ value: 'A+', label: 'CSP rating' }],
    tags: ['WebAuthn', 'CSP', 'WAF', 'TypeScript'],
    challenge:
      'Replace phishable passwords for an internal platform and put a gateway in front of legacy services that were never built to face the internet.',
    solution:
      'Passkeys with attestation checks and signature counters, nonce-based strict CSP, and a gateway that validates every request against a schema before it reaches a service.',
    codeTitle: 'gateway/headers.ts',
    snippet: `res.setHeader('Content-Security-Policy', [
  "default-src 'self'",
  \`script-src 'nonce-\${nonce}' 'strict-dynamic'\`,
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
].join('; '));`,
  },
  {
    id: 'kinetic',
    code: '04',
    name: 'KINETIC LABS',
    accent: 'ink',
    shape: 'square',
    category: 'Creative Computation',
    tagline: 'Kinetic canvas and creative computation showcase.',
    metrics: [{ value: '60', label: 'FPS' }],
    tags: ['Canvas', 'GSAP', 'WebGL', 'TypeScript'],
    challenge:
      'Make thousands of animated shapes respond to input on mid-range phones without dropping frames or draining batteries.',
    solution:
      'One shared ticker, transform-only animation, object pooling for particles, and adaptive quality that sheds detail before it sheds frames.',
    codeTitle: 'kinetic/loop.ts',
    snippet: `gsap.ticker.add((time, deltaMs) => {
  const budget = 16.6 - deltaMs;
  quality = budget < 0 ? Math.max(0.5, quality - 0.1) : Math.min(1, quality + 0.02);
  field.step(deltaMs, quality);
  field.draw(ctx); // transforms only, no layout reads
});`,
  },
];

export interface PipelineStation {
  code: string;
  title: string;
  accent: Accent;
  detail: string;
}

export const pipeline: PipelineStation[] = [
  {
    code: '01.',
    title: 'Spec & Threat Model',
    accent: 'red',
    detail: 'Requirements, data flows and abuse cases mapped before a line of code.',
  },
  {
    code: '02.',
    title: 'Distributed Core',
    accent: 'blue',
    detail: 'Idempotent services, explicit contracts and failure modes designed in.',
  },
  {
    code: '03.',
    title: 'Resilient Test Matrix',
    accent: 'yellow',
    detail: 'Unit, integration, load and chaos tests gate every merge.',
  },
  {
    code: '04.',
    title: 'Cloud Deploy & Monitor',
    accent: 'ink',
    detail: 'Infrastructure as code, staged rollouts, and alerts that page a human.',
  },
];

export interface AttackVector {
  id: string;
  label: string;
  short: string;
  payload: string;
  defense: string;
  logs: string[];
}

export const attacks: AttackVector[] = [
  {
    id: 'sqli',
    label: 'SQL Injection',
    short: 'SQLi',
    payload: "' OR 1=1; --",
    defense: 'Parameterized query enforced',
    logs: [
      `INBOUND  POST /api/search  q="' OR 1=1; --"`,
      'WAF      signature match: SQL tautology (CRS 942100)',
      'DB       parameterized query enforced, payload bound as a literal',
      'RESULT   0 rows leaked',
      'DEFLECTED  403 · Parameterized Query enforced, 0 vulnerabilities',
    ],
  },
  {
    id: 'xss',
    label: 'Cross-Site Scripting (XSS)',
    short: 'XSS',
    payload: '<img src=x onerror=alert(1)>',
    defense: 'Output encoding + strict CSP',
    logs: [
      'INBOUND  POST /api/comments  body="<img src=x onerror=alert(1)>"',
      'ENCODER  HTML context: entities escaped before render',
      "CSP      script-src 'nonce-…' blocks inline handler",
      'DOM      rendered with textContent, never innerHTML',
      'DEFLECTED  payload neutralised, 0 scripts executed',
    ],
  },
  {
    id: 'replay',
    label: 'Replay Attack',
    short: 'REPLAY',
    payload: 'POST /transfer  nonce=7f3a…c9',
    defense: 'Nonce + timestamp window + signature',
    logs: [
      'INBOUND  POST /api/transfer  nonce=7f3a…c9  age=312s',
      'AUTH     signature valid, timestamp outside ±30s window',
      'NONCE    7f3a…c9 already consumed: replay detected',
      'SESSION  token revoked, owner notified',
      'DEFLECTED  401 · replayed request rejected',
    ],
  },
];

export interface ProbeEndpoint {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  service: string;
  latencyMs: [number, number];
  body: Record<string, unknown>;
}

export const probeEndpoints: ProbeEndpoint[] = [
  {
    id: 'jobs',
    method: 'GET',
    path: '/v1/jobs/kx-4821',
    service: 'KRONOS',
    latencyMs: [1.1, 2.4],
    body: {
      id: 'kx-4821',
      state: 'completed',
      attempts: 1,
      lease: { holder: 'worker-07', fencingToken: 3184 },
      durationMs: 412,
    },
  },
  {
    id: 'usage',
    method: 'GET',
    path: '/v1/usage?window=1h',
    service: 'AURA',
    latencyMs: [3.2, 7.8],
    body: {
      tenant: 'acme',
      window: '1h',
      units: 1840312,
      lateEventsReconciled: 214,
      invoiceDraft: 'inv_draft_8c1e',
    },
  },
  {
    id: 'assert',
    method: 'POST',
    path: '/v1/auth/assert',
    service: 'AEGIS',
    latencyMs: [4.5, 9.6],
    body: {
      verified: true,
      method: 'webauthn',
      userVerification: 'required',
      signCount: 58,
      session: { ttl: 900, rotation: 'on-privilege-change' },
    },
  },
];

/** Stripe's published test card numbers. The simulator accepts nothing else. */
export const testCards: Record<string, { outcome: 'succeeded' | 'declined'; reason?: string }> = {
  '4242424242424242': { outcome: 'succeeded' },
  '4000000000000002': { outcome: 'declined', reason: 'card_declined' },
  '4000000000009995': { outcome: 'declined', reason: 'insufficient_funds' },
};

export const projectTypes = [
  'Backend system',
  'Cloud & data platform',
  'Frontend & security',
  'Full product build',
  'Security review',
] as const;
