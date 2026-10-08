// All site content. Sections render from these objects.
// Content rule: no invented metrics, clients or people. Anything still unconfirmed is marked TODO(content).

export type Accent = 'blue' | 'yellow' | 'red' | 'ink' | 'paper';
export type Shape = 'square' | 'circle' | 'triangle';
export type Theme = 'paper' | 'ink' | 'charcoal' | 'red' | 'yellow' | 'cobalt';

export const brand = {
  name: 'AXIOMFORGE',
  descriptor: 'Software · Cloud · Web · Security',
  narrative: 'We build the interface, engineer the system behind it, put it into production, and secure what we ship.',
  email: 'axiomforge.dev.03@gmail.com',
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
  { id: 'people', label: 'Team', nav: true },
  { id: 'work', label: 'Work', nav: true },
  { id: 'system', label: 'System', nav: true },
  { id: 'security', label: 'Security', nav: false },
  { id: 'lab', label: 'Lab', nav: false },
  { id: 'contact', label: 'Contact', nav: true },
] as const;

export const chapterCount = String(chapters.length).padStart(2, '0');
export const chapterNo = (id: string): string =>
  String(chapters.findIndex((c) => c.id === id) + 1).padStart(2, '0');

export const philosophy = {
  statement:
    'One engineering team. We build the interface, engineer the system behind it, put it into production, and secure what we ship.',
  principles: [
    { no: '01', title: 'Precision', shape: 'square', text: 'Every element earns its place. Nothing ships because it looks clever.' },
    { no: '02', title: 'Resilience', shape: 'circle', text: 'Systems designed to fail safely and recover predictably.' },
    { no: '03', title: 'Security', shape: 'triangle', text: 'Threat modelling starts at the first sketch, not the last sprint.' },
  ] satisfies { no: string; title: string; shape: Shape; text: string }[],
};

export interface ProfileBlock {
  title: string;
  items: string[];
}

export interface TeamMember {
  id: string;
  index: string;
  first: string;
  last: string;
  role: string; // AxiomForge role
  focus: string; // discipline line
  line: string; // the one sentence on the main page
  linkedin: string;
  shape: Shape;
  accent: Accent;
  summary: string[];
  expertise: string[];
  blocks: ProfileBlock[];
}

// Source of truth: the profiles supplied by the team. Nothing beyond them is added.
// Order matters for continuity: the hero circle is handed to the first shape, and the
// last shape (triangle) is handed to the first project's geometry.
export const team: TeamMember[] = [
  {
    id: 'himanshu',
    index: '01',
    first: 'Himanshu',
    last: 'Vishwakarma',
    role: 'Software Engineering',
    focus: 'Software / Backend / Testing',
    line: 'Builds the systems behind the interface.',
    linkedin: 'https://www.linkedin.com/in/himanshuvishwakarma0302/',
    shape: 'square',
    accent: 'blue',
    summary: [
      'Himanshu works across backend engineering, application architecture, performance, testing and production software systems.',
      'His experience spans modern web applications, microservices, APIs, databases and high-performance software infrastructure.',
    ],
    expertise: ['Backend engineering', 'Software architecture', 'APIs & application logic', 'Testing', 'Performance'],
    blocks: [
      {
        title: 'Experience',
        items: [
          'Software Engineer at Postman: performance-testing infrastructure, reusable package systems, backend and SQL optimisation.',
          'Software Engineer at Headout: separated checkout into a dedicated booking microservice supporting high-volume booking traffic.',
        ],
      },
      { title: 'Tools', items: ['Node.js', 'Express.js', 'Next.js', 'Spring Boot', 'SQL', 'Docker', 'AWS'] },
    ],
  },
  {
    id: 'saurabh',
    index: '02',
    first: 'Saurabh',
    last: 'Maurya',
    role: 'Cloud & Infrastructure',
    focus: 'Cloud / DevOps / Database / Infrastructure',
    line: 'Builds the infrastructure behind the product.',
    linkedin: 'https://www.linkedin.com/in/saurabh-maurya-a08b82203/',
    shape: 'circle',
    accent: 'yellow',
    summary: [
      'Saurabh works across cloud architecture, deployment, databases, automation, monitoring and production operations.',
      'From server to database to deployment, he makes sure the system survives outside the development environment.',
    ],
    expertise: ['Cloud architecture', 'Deployment & CI/CD', 'Databases', 'Monitoring', 'Production operations', 'Infrastructure security'],
    blocks: [
      {
        title: 'Experience',
        items: [
          'Production infrastructure across cloud deployment, databases, monitoring and CI/CD.',
          'Production websites, cloud migration, monitoring and client infrastructure.',
        ],
      },
      { title: 'Tools', items: ['AWS', 'Terraform', 'Kubernetes', 'Docker', 'GitHub Actions', 'ArgoCD', 'PostgreSQL', 'Nginx', 'Cloudflare', 'Prometheus', 'Grafana'] },
    ],
  },
  {
    id: 'ayan',
    index: '03',
    first: 'Ayan',
    last: 'Abbas',
    role: 'Frontend & Security',
    focus: 'Frontend / Security',
    line: 'Builds the interface. Connects the system. Then tries to break it.',
    linkedin: 'https://www.linkedin.com/in/ayan-abbas-521897271/',
    shape: 'triangle',
    accent: 'red',
    summary: [
      'Ayan combines frontend development and full-stack freelance experience with offensive and defensive security.',
      'His role spans interface implementation, backend integration and the final security validation of the systems we ship.',
    ],
    expertise: ['Frontend', 'Full-stack', 'VAPT', 'SOC', 'Security validation', 'AI security'],
    blocks: [
      {
        title: 'Full-stack',
        items: [
          'About a year of freelance full-stack work, building websites that help businesses establish an online presence and grow.',
          'Business need → interface → backend integration → deployment → security.',
        ],
      },
      {
        title: 'Blue team',
        items: [
          'SOC, detection and incident response: Splunk, Microsoft Sentinel, Wazuh, MITRE ATT&CK.',
          '300+ alerts triaged across simulated incidents; 20+ ATT&CK-mapped detections.',
        ],
      },
      {
        title: 'Red team',
        items: [
          'Authorized VAPT across web/API, network and Active Directory environments.',
          'Burp Suite, Nmap, Nikto, Metasploit, OWASP Top 10, CVSS reporting and retesting.',
        ],
      },
    ],
  },
];

export type TeamId = 'himanshu' | 'saurabh' | 'ayan';

export interface Contribution {
  /** A team member, only where the source material names them. */
  who: TeamId;
  what: string;
}

/** Where a project sits in the archive. */
export type ProjectGroup = 'client' | 'flagship' | 'production' | 'software' | 'initiative';

export interface Project {
  id: string;
  title: string;
  /** How the title breaks across lines in large type. */
  lines: string[];
  group: ProjectGroup;
  /** The organisation the work was for, as it names itself. */
  client?: string;
  /** Category: two short lines (domain / kind). */
  category: [string, string];
  year?: string;
  /** "Live", "Production system", "Internal implementation", "Current initiative". */
  status: string;
  /** Only a real public URL. Never invented. */
  url?: string;
  shape: Shape;
  accent: Accent;
  theme: Theme;
  /** One line for posters and the archive index. */
  summary: string;
  /** The mini case study. */
  what: string;
  problem: string;
  usage: string;
  /** What was delivered, where the source supports it. Empty is not shown. */
  built: string[];
  /** Verified technologies only. */
  tech: string[];
  /** The system as a chain, where the source gives one. */
  flow?: string[];
  /** Named contributions, only where the source supports them. */
  contributors: Contribution[];
  /** Outcomes only as the source states them; never a number it does not give. */
  outcome?: string;
  /** Homepage Featured Work. Exactly three projects carry it. */
  featured: boolean;
}

const SAURABH = (what: string): Contribution[] => [{ who: 'saurabh', what }];

// One list for the whole site: the homepage shows the featured three, the Projects
// archive shows everything. Order is the display order within each group.
//
// Sources: each client project's live site (inspected 2026-10-08), and the project and
// production-infrastructure material the team supplied (Saurabh's professional work).
// Saurabh is named only where that material is infrastructure, DevOps or database work
// he is credited with; software projects whose ownership is not stated name nobody.
// No metrics, percentages, clients, years or features beyond those sources are claimed.
export const projects: Project[] = [
  // ---------------------------------------------------------------- Client work
  {
    id: 'mughlai',
    title: 'Mughlai Dastarkhwan',
    lines: ['Mughlai', 'Dastarkhwan'],
    group: 'client',
    client: 'The Mughlai Dastarkhwan',
    category: ['Restaurant', 'Web experience'],
    status: 'Live',
    url: 'https://nawabi-wrap.preview.emergentagent.com/?utm_source=share',
    shape: 'triangle',
    accent: 'yellow',
    theme: 'red',
    summary: 'Where royal heritage meets modern luxury: a Mughlai restaurant told as a story.',
    what:
      'The customer-facing website for The Mughlai Dastarkhwan, a Mughlai restaurant presented as "where royal heritage meets modern luxury". It tells the story of the cuisine as a chaptered heritage timeline, then presents a signature collection of dishes and a full menu with origin notes, pairings and prices.',
    problem:
      'A heritage restaurant is hard to understand from a listing alone. Guests need to see what makes the food distinctive, what to order and how to book, in one place that feels like the restaurant itself.',
    usage:
      'It works as the restaurant’s digital front door. Visitors discover the restaurant and its story, browse the signature dishes and the menu, and move straight to reserving a table.',
    built: ['Customer-facing website', 'Chaptered heritage story', 'Signature collection and full menu', 'Table-reservation calls to action'],
    tech: [],
    contributors: [],
    featured: true,
  },
  {
    id: 'aijr-community',
    title: 'All India Jamiat Rayeen',
    lines: ['All India', 'Jamiat', 'Rayeen'],
    group: 'client',
    client: 'All India Jamiat Rayeen',
    category: ['Community organisation', 'Web platform'],
    status: 'Live',
    url: 'https://allindiajamiatrayeen.com/',
    shape: 'circle',
    accent: 'red',
    theme: 'ink',
    summary: 'The public home of a community organisation working across several states of India.',
    what:
      'The official website of All India Jamiat Rayeen, a community organisation working toward the social, educational, cultural and economic development of the Rayeen community in India. It sets out the organisation’s vision, mission and objectives, its state units and its leadership, alongside events and news, a gallery and membership.',
    problem:
      'A community spread across several states needs one trusted place to see what the organisation stands for, follow what it is doing and get involved, rather than relying on scattered word of mouth.',
    usage:
      'The organisation uses it as its public presence: to explain its objectives, from education and scholarships to welfare and relief, introduce its leadership, publish events and its gallery, point families to its Rayeen Shadi platform, and take membership requests and messages through its forms.',
    built: [],
    tech: [],
    contributors: [],
    featured: true,
  },
  {
    id: 'ccs',
    title: 'CCS Infratech',
    lines: ['CCS', 'Infratech'],
    group: 'client',
    client: 'CCS Infratech',
    category: ['Real estate', 'Web platform'],
    status: 'Live',
    url: 'https://www.ccsinfratech.com/',
    shape: 'square',
    accent: 'ink',
    theme: 'paper',
    summary: 'A Lucknow real-estate developer’s platform, from company story to AMOR’s luxury villas.',
    what:
      'The production website of CCS Infratech, a real-estate developer in Lucknow, and the AWS infrastructure it runs on. The site presents the company and its developments, including AMOR, its premium luxury-villa project with a page of its own, together with blogs, press coverage and the project’s UP RERA registration.',
    problem:
      'Buying a home is a high-trust decision. A developer has to present its projects, credentials and contact routes clearly, and the site behind them has to stay reliably online.',
    usage:
      'CCS Infratech uses it as its public digital presence: to showcase its developments and AMOR, tell its company story, publish blogs and media, offer a brochure download and visit scheduling, and capture buyer enquiries.',
    built: ['Production website', 'AWS infrastructure'],
    tech: ['AWS'],
    contributors: SAURABH('Production website and AWS infrastructure'),
    featured: true,
  },
  {
    id: 'tripsortify',
    title: 'TripSortify',
    lines: ['TripSortify'],
    group: 'client',
    client: 'TripSortify',
    category: ['Travel', 'Holiday packages'],
    status: 'Live',
    url: 'https://www.tripsortify.in/',
    shape: 'circle',
    accent: 'yellow',
    theme: 'cobalt',
    summary: 'A holiday-package platform where trips are sorted by travel style.',
    what:
      'TripSortify is a holiday-package travel platform. Visitors search and browse package deals with itineraries and prices, explore trips by travel style (honeymoon, family, solo, group, spiritual and weekend) and send enquiries.',
    problem:
      'Planning a trip means comparing destinations, stays, logistics and prices across many sources. TripSortify sorts that into curated packages and connects travellers with its travel experts for a personalised itinerary.',
    usage:
      'The company uses the site to publish its packages and deals, explain how booking, payment safety and cancellations work, answer common questions, and turn visitors into enquiries for packaged or custom tours.',
    built: [],
    tech: [],
    contributors: [],
    featured: false,
  },
  {
    id: 'saffron',
    title: 'Golden Saffron',
    lines: ['Golden', 'Saffron'],
    group: 'client',
    client: 'The Golden Saffron',
    category: ['Restaurant', 'Web experience'],
    status: 'Live',
    url: 'https://thegoldensaffron.netlify.app/',
    shape: 'square',
    accent: 'ink',
    theme: 'yellow',
    summary: 'Where India meets Arabia in golden luxury: an Indo-Arabic restaurant website.',
    what:
      'The website of The Golden Saffron, an Indo-Arabic restaurant presented as "where India meets Arabia in golden luxury". It tells an origin story of saffron, spice routes and royal kitchens, then presents a signature collection and a full menu with origins, pairings and prices.',
    problem:
      'A restaurant built on two culinary traditions needs to explain that idea quickly and make its dishes easy to explore, so a first-time visitor understands the concept and knows what to order.',
    usage:
      'It is the restaurant’s customer-facing presence: visitors learn the story, browse the signature dishes and the menu, and act on its ordering calls to action.',
    built: ['Customer-facing website', 'Origin story', 'Signature collection and full menu', 'Ordering calls to action'],
    tech: [],
    contributors: [],
    featured: false,
  },
  {
    id: 'forge',
    title: 'Forge Future',
    lines: ['Forge', 'Future'],
    group: 'client',
    category: ['Fitness / Gym', 'Website'],
    status: 'Live',
    url: 'https://forge-future-6.preview.emergentagent.com/?utm_source=share',
    shape: 'triangle',
    accent: 'red',
    theme: 'ink',
    summary: 'Forge your future: a gym and performance-facility website built on discipline.',
    what:
      'A website for a gym and performance facility, built around the line "forge your future". It walks visitors through the facility zone by zone, introduces the coaches, sets out the membership tiers and ends with how to visit.',
    problem:
      'A gym is chosen on trust and atmosphere. Before anyone walks in, they want to see the floors, the people who will coach them and how membership works.',
    usage:
      'It serves as the facility’s public face: prospective members tour the zones, meet the coaches, compare membership tiers and find the contact and visiting details.',
    built: ['Customer-facing website', 'Facility zones', 'Coaches', 'Membership tiers', 'Visit and contact'],
    tech: [],
    contributors: [],
    featured: false,
  },

  // ---------------------------------------------------------- Flagship engineering
  {
    id: 'fleet',
    title: 'Large-Scale Fleet Management',
    lines: ['Fleet', 'Management'],
    group: 'flagship',
    category: ['Real estate, travel & corporate IT', 'Infrastructure operations'],
    status: 'Production system',
    shape: 'square',
    accent: 'yellow',
    theme: 'ink',
    summary: '80+ live public-facing production web environments, provisioned, secured and run.',
    what:
      'Provisioning, managing and securing the infrastructure behind more than 80 live public-facing portals and corporate websites. The work spans domain and DNS routing, SSL termination, reverse-proxy configuration, PM2 process management and day-to-day deployment operations across AWS EC2, Hostinger and Vercel.',
    problem:
      'Dozens of client sites had grown up across fragmented hosting environments, each with its own routing, certificates and deployment habits. That makes every deployment slower, every incident harder to trace and every bill harder to justify.',
    usage:
      'The fleet runs the clients’ live portals every day. Audits of existing infrastructure, hosting consolidation, traffic scaling, CORS troubleshooting and production fixes are handled across it as one operation rather than site by site.',
    built: [
      'Domain and DNS routing',
      'SSL termination',
      'Reverse-proxy configuration',
      'PM2 process management',
      'Traffic scaling',
      'CORS troubleshooting',
      'Infrastructure audits',
      'Hosting consolidation',
      'Deployment operations',
      'Production troubleshooting',
    ],
    tech: ['AWS EC2', 'Next.js', 'Node.js', 'PM2', 'Caddy', 'Nginx', 'Cloudflare', 'SSL/TLS', 'Hostinger', 'Vercel'],
    contributors: SAURABH('Provisioning, security and operation of the fleet'),
    outcome:
      'Consolidating fragmented hosting environments streamlined deployments and saved clients recurring cloud costs.',
    featured: false,
  },
  {
    id: 'qms',
    title: 'Enterprise QMS Cloud Migration',
    lines: ['QMS Cloud', 'Migration'],
    group: 'flagship',
    category: ['Enterprise internal operations', 'Platform engineering'],
    status: 'Production system',
    shape: 'triangle',
    accent: 'blue',
    theme: 'paper',
    summary: 'A legacy .NET Quality Management System moved to AWS with an automated delivery framework.',
    what:
      'The modernisation and migration of a legacy .NET enterprise Quality Management System onto AWS, with an automated DevOps framework around it. Infrastructure is defined in Terraform, the application is containerised and delivered through CI/CD, and data moves to a managed SQL Server database on Amazon RDS.',
    problem:
      'A business-critical quality system on legacy infrastructure is hard to change safely: deployments are manual, environments drift and every release carries risk. Moving it needed the infrastructure, the pipeline and the database to be rebuilt together.',
    usage:
      'The organisation runs its quality-management operations on the migrated system. Releases go through the automated pipeline into Elastic Beanstalk or Kubernetes, while monitoring and production troubleshooting keep it healthy.',
    built: ['Legacy application modernisation', 'Cloud migration', 'Terraform infrastructure', 'CI/CD pipeline', 'Managed database (RDS)', 'Deployment automation', 'Monitoring', 'Production troubleshooting'],
    tech: ['C#', '.NET', 'AWS Elastic Beanstalk', 'Amazon RDS (SQL Server)', 'CodePipeline', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
    flow: ['Code', 'Build', 'Test', 'Docker', 'Kubernetes / Elastic Beanstalk', 'RDS'],
    contributors: SAURABH('Migration, infrastructure and delivery automation'),
    featured: false,
  },
  {
    id: 'observability',
    title: 'Observability & Database Optimisation',
    lines: ['Observability', '+ Databases'],
    group: 'flagship',
    category: ['Infrastructure monitoring', 'Data operations'],
    status: 'Production system',
    shape: 'circle',
    accent: 'red',
    theme: 'cobalt',
    summary: 'Server metrics on one dashboard, and the databases behind the applications tuned and kept private.',
    what:
      'A monitoring platform that collects CPU, memory, disk, network, application-health and availability metrics from Linux servers through Node Exporter and Prometheus into Grafana, paired with hands-on PostgreSQL and MongoDB administration: configuration, query and sorting optimisation, and production troubleshooting.',
    problem:
      'Without shared metrics, an outage is noticed by users first and diagnosed by guesswork. Slow queries and exposed databases add risk at the layer most applications depend on.',
    usage:
      'Engineers watch server health and resource usage in Grafana and trace incidents from the application through the API, database, server and network. Databases are kept off the public internet unless there is a reason to expose them.',
    built: ['Prometheus + Grafana monitoring', 'Node Exporter on Linux servers', 'PostgreSQL configuration', 'MongoDB administration', 'Query and sorting optimisation', 'Production troubleshooting'],
    tech: ['Prometheus', 'Grafana', 'Node Exporter', 'PostgreSQL', 'MongoDB', 'Shell scripting', 'Linux'],
    flow: ['Linux servers', 'Node Exporter', 'Prometheus', 'Grafana'],
    contributors: SAURABH('Monitoring platform and database administration'),
    featured: false,
  },
  {
    id: 'finops',
    title: 'AWS Cost Manager & FinOps Engine',
    lines: ['AWS Cost', 'Manager'],
    group: 'flagship',
    category: ['Cloud financial operations', 'Automation'],
    status: 'Production system',
    shape: 'square',
    accent: 'red',
    theme: 'yellow',
    summary: 'Automation that finds idle and wasted AWS resources and turns them into recommendations.',
    what:
      'An automation engine built on AWS Billing APIs, Lambda and Python that scans cloud accounts for idle EC2 instances, underutilised databases, unattached EBS volumes and other resource waste, watches budgets through CloudWatch, and produces cost-control recommendations. Its infrastructure is defined in Terraform.',
    problem:
      'Cloud spend grows quietly: an instance nobody switched off, a volume left behind, a database sized for a peak that never came. Finding that by hand across accounts is slow and rarely done.',
    usage:
      'It runs as an automated check over client AWS accounts, flagging waste and budget issues and recommending what to stop, resize or remove.',
    built: ['Idle and underused resource detection', 'Unattached EBS volume detection', 'Budget monitoring', 'Automated cost recommendations'],
    tech: ['AWS Billing APIs', 'AWS Lambda', 'Python', 'CloudWatch', 'Terraform'],
    contributors: SAURABH('Cost engine and automation'),
    outcome: 'Contributed to capital savings for clients.',
    featured: false,
  },
  {
    id: 'analytics',
    title: 'Enterprise Analytics & Visualisation Portals',
    lines: ['Analytics', 'Portals'],
    group: 'flagship',
    category: ['Application development', 'Business intelligence'],
    status: 'Internal implementation',
    shape: 'triangle',
    accent: 'yellow',
    theme: 'red',
    summary: 'Full-stack portals that turn operational data into dashboards, from SQL Server to the chart.',
    what:
      'Full-stack business applications and analytics portals: a React and Vite front end with Recharts dashboards, a C# / .NET 9 Web API and SQL Server underneath. They include registration and business workflows, database-driven charts and algorithm visualisation such as BFS, DFS and Dijkstra.',
    problem:
      'Operational data sitting in a database is no use to the people running the operation until it is processed and shown clearly, live, without someone exporting spreadsheets.',
    usage:
      'Teams use the portals for registration and business processes and read operational data through dynamic, database-driven dashboards.',
    built: ['Registration and business applications', 'Dynamic dashboards', 'Database-driven charts', 'API integration', 'Complex data processing', 'Algorithm visualisation (BFS, DFS, Dijkstra)'],
    tech: ['React', 'Vite', 'Recharts', 'C# / .NET 9 Web API', 'SQL Server'],
    flow: ['React / Vite', '.NET 9 Web API', 'SQL Server'],
    contributors: [],
    featured: false,
  },

  // ------------------------------------------------------ Production implementations
  {
    id: 'aijr-publisher',
    title: 'AIJR — AWS Production Infrastructure',
    lines: ['AIJR', 'Infrastructure'],
    group: 'production',
    client: 'AIJR Publisher',
    category: ['Scholarly publishing', 'AWS infrastructure'],
    status: 'Live',
    url: 'https://aijr.org/',
    shape: 'square',
    accent: 'blue',
    theme: 'paper',
    summary: 'Production AWS infrastructure for an international open-access scholarly publisher.',
    what:
      'Production infrastructure on AWS for AIJR, an international open-access scholarly publisher of journals, books and conference proceedings. It runs on EC2 with Amazon Linux and PostgreSQL 17, with the databases and users created for the application and the database bound locally rather than exposed.',
    problem:
      'A publisher’s site carries authors’ submissions and published research; it needs an application stack and database that are set up correctly, kept private and supported once live.',
    usage:
      'The infrastructure serves AIJR’s public site, where authors submit papers and readers and institutions find its publications, with production troubleshooting and operational support handed over.',
    built: ['EC2 / Amazon Linux setup', 'PostgreSQL 17 installation', 'Database and user creation', 'Local database binding', 'Application infrastructure', 'Production troubleshooting', 'Operational support and handover'],
    tech: ['AWS EC2', 'Amazon Linux', 'PostgreSQL 17'],
    contributors: SAURABH('AWS production infrastructure'),
    featured: false,
  },
  {
    id: 'monitoring',
    title: 'Enterprise Monitoring & Observability',
    lines: ['Enterprise', 'Monitoring'],
    group: 'production',
    category: ['Infrastructure', 'Observability'],
    status: 'Internal implementation',
    shape: 'circle',
    accent: 'yellow',
    theme: 'ink',
    summary: 'One place for engineering and operations to see server health before users feel it.',
    what: 'A monitoring stack for Linux servers in cloud infrastructure: Node Exporter on each host, Prometheus collecting and storing the metrics, Grafana presenting them.',
    problem: 'Teams without shared visibility find out about failing disks, exhausted memory or down services from complaints, and diagnose them one server at a time.',
    usage: 'Internal engineering and operations teams use the Grafana dashboards to watch availability and resource usage and to start every investigation from the same data.',
    built: ['Node Exporter deployment', 'Prometheus metrics collection', 'Grafana dashboards'],
    tech: ['Prometheus', 'Grafana', 'Node Exporter', 'Linux', 'Cloud infrastructure'],
    flow: ['Linux servers', 'Node Exporter', 'Prometheus', 'Grafana'],
    contributors: SAURABH('Monitoring stack'),
    featured: false,
  },
  {
    id: 'containers',
    title: 'Containerisation & CI/CD Automation',
    lines: ['Containers', '+ CI/CD'],
    group: 'production',
    category: ['DevOps', 'Delivery'],
    status: 'Internal implementation',
    shape: 'square',
    accent: 'red',
    theme: 'ink',
    summary: 'Applications packaged once and deployed the same way to staging and production.',
    what: 'Applications containerised as Docker images and run as Kubernetes workloads, built and shipped by Jenkins pipelines from Git, with environment configuration and Apache Tomcat administration for the Java services.',
    problem: 'When staging and production are set up by hand, they drift, and a release that worked in one fails in the other.',
    usage: 'Teams ship through the pipeline: code is built, tested, packaged and deployed the same way every time, so staging and production stay consistent.',
    built: ['Application containerisation', 'Docker images', 'Kubernetes workloads', 'Jenkins pipelines', 'Environment configuration', 'Tomcat administration', 'Deployment automation'],
    tech: ['Docker', 'Kubernetes', 'Jenkins', 'Git', 'Shell scripting', 'Linux', 'Apache Tomcat'],
    flow: ['Code', 'Build', 'Test', 'Package', 'Deploy'],
    contributors: SAURABH('Containerisation and pipelines'),
    featured: false,
  },
  {
    id: 'client-infra',
    title: 'Real Estate & Travel — Client Web Infrastructure',
    lines: ['Client Web', 'Infrastructure'],
    group: 'production',
    category: ['Real estate & travel', 'Web infrastructure'],
    status: 'Production system',
    shape: 'triangle',
    accent: 'blue',
    theme: 'paper',
    summary: 'The hosting, routing and security behind live real-estate and travel websites and portals.',
    what: 'End-to-end web infrastructure for live public-facing real-estate and travel websites and portals: domains and DNS through GoDaddy and Cloudflare, servers on AWS EC2, Hostinger and Vercel, Nginx or Caddy as the reverse proxy, SSL, and Node.js / Next.js applications kept running under PM2.',
    problem: 'A client website is only as reliable as the pieces nobody sees: a misconfigured DNS record, an expired certificate or a crashed process takes the business offline.',
    usage: 'The clients’ live sites and portals run on this setup day to day; it is backed by security configuration, backup and infrastructure planning, and handed over to the client.',
    built: ['Domain and DNS configuration', 'Cloudflare setup', 'Server provisioning on EC2', 'Hosting', 'Reverse proxy', 'SSL', 'Application deployment under PM2', 'Troubleshooting', 'Security configuration', 'Backup and infrastructure planning', 'Client handover'],
    tech: ['AWS', 'Vercel', 'Hostinger', 'GoDaddy', 'Cloudflare', 'Nginx', 'Caddy', 'Node.js', 'Next.js', 'PM2', 'SSL/TLS'],
    contributors: SAURABH('Client web infrastructure'),
    featured: false,
  },
  {
    id: 'node-deploy',
    title: 'Next.js / Node.js Production Deployment',
    lines: ['Next.js', 'Deployment'],
    group: 'production',
    category: ['Production operations', 'Deployment'],
    status: 'Production system',
    shape: 'circle',
    accent: 'red',
    theme: 'cobalt',
    summary: 'The path from Cloudflare to a running Node.js process, and what to do when it breaks.',
    what: 'Production deployment infrastructure for Next.js and Node.js applications on AWS EC2 and Linux: Cloudflare and DNS in front, Caddy or Nginx as the reverse proxy with SSL/TLS, and PM2 running the application processes.',
    problem: 'Production fails in specific ways: a build breaks, a module is missing, a process stops, CORS rejects a request, the proxy or certificate is misconfigured, or the app cannot reach its database.',
    usage: 'Live applications are served through this chain, and incidents are worked through it: PM2 restarts, build failures, missing modules, CORS, proxy and SSL problems, domain routing, logs, database connectivity and environment configuration.',
    built: ['Reverse-proxy and SSL setup', 'PM2 process management', 'Domain routing', 'Environment configuration', 'Incident troubleshooting'],
    tech: ['Next.js', 'Node.js', 'PM2', 'Caddy', 'Nginx', 'Cloudflare', 'AWS EC2', 'Linux', 'SSL/TLS'],
    flow: ['Cloudflare', 'DNS', 'Reverse proxy', 'PM2', 'Node.js / Next.js'],
    contributors: SAURABH('Deployment infrastructure and operations'),
    featured: false,
  },
  {
    id: 'databases',
    title: 'Database Administration & Optimisation',
    lines: ['Database', 'Administration'],
    group: 'production',
    category: ['Data operations', 'Administration'],
    status: 'Production system',
    shape: 'square',
    accent: 'yellow',
    theme: 'ink',
    summary: 'PostgreSQL, MongoDB, MySQL and SQL Server, set up, connected, migrated and tuned.',
    what: 'Database work across PostgreSQL, MongoDB, MySQL and SQL Server: PostgreSQL setup with databases and users, production configuration, SQL Server on RDS, MongoDB administration and query and sorting work, migrations and restores.',
    problem: 'Most production problems that look like application bugs end in the database: a connection that cannot be made, a slow query, a migration that did not restore cleanly.',
    usage: 'Applications depend on these databases in production. Problems are traced layer by layer, from the application to the API, database, server, network and infrastructure, until the cause is found.',
    built: ['PostgreSQL setup', 'Database and user creation', 'Production configuration', 'SQL Server / RDS', 'MongoDB administration', 'Query and sorting work', 'Connectivity troubleshooting', 'Application and database integration', 'Migration and restore'],
    tech: ['PostgreSQL', 'MongoDB', 'MySQL', 'SQL Server'],
    flow: ['Application', 'API', 'Database', 'Server', 'Network', 'Infrastructure'],
    contributors: SAURABH('Database administration'),
    featured: false,
  },
  {
    id: 'dotnet',
    title: 'Legacy .NET Development & Modernisation',
    lines: ['Legacy .NET', 'Modernisation'],
    group: 'production',
    category: ['Application development', 'Modernisation'],
    status: 'Internal implementation',
    shape: 'triangle',
    accent: 'yellow',
    theme: 'paper',
    summary: 'Windows Forms and .NET Framework applications developed, then moved toward .NET 9, containers and AWS.',
    what: 'Development and modernisation of .NET applications: Windows Forms and .NET Framework applications with RDLC reporting and SQL Server, moving toward .NET 9 with REST APIs and Entity Framework Core, then containerised with Docker and migrated to AWS.',
    problem: 'Legacy desktop applications keep businesses running long after their platform has aged; they become hard to extend, deploy and host.',
    usage: 'The applications keep serving their users while being brought onto a current .NET runtime, an API-based architecture and cloud hosting.',
    built: ['Application development', 'Migration toward .NET 9 and REST APIs', 'Containerisation', 'Cloud migration'],
    tech: ['C#', '.NET Framework', '.NET 9', 'Windows Forms', 'REST APIs', 'Entity Framework Core', 'SQL Server', 'RDLC', 'Docker', 'AWS'],
    contributors: [],
    featured: false,
  },
  {
    id: 'registration',
    title: 'Full-Stack Registration & Business Application',
    lines: ['Registration', 'Application'],
    group: 'production',
    category: ['Application development', 'Full stack'],
    status: 'Internal implementation',
    shape: 'circle',
    accent: 'blue',
    theme: 'ink',
    summary: 'A registration and business application from the form to the database, tested end to end.',
    what: 'A full-stack registration and business application: a React / Vite front end, a .NET 9 Web API with backend validation, and SQL Server underneath.',
    problem: 'Registration data has to be right the first time. Validation in the browser alone is not enough; the API has to enforce it and the database has to store it cleanly.',
    usage: 'Users register and complete business workflows through the front end, while the API validates every request before it reaches the database.',
    built: ['Front end', 'REST API', 'Backend validation', 'Database integration', 'Application architecture', 'End-to-end testing'],
    tech: ['React', 'Vite', '.NET 9 Web API', 'SQL Server'],
    flow: ['React / Vite', '.NET 9 Web API', 'SQL Server'],
    contributors: [],
    featured: false,
  },
  {
    id: 'dashboard',
    title: 'Production Dashboard & Business Analytics',
    lines: ['Production', 'Dashboard'],
    group: 'production',
    category: ['Business analytics', 'Dashboards'],
    status: 'Internal implementation',
    shape: 'square',
    accent: 'red',
    theme: 'cobalt',
    summary: 'Production metrics as live, model-wise charts instead of reports assembled by hand.',
    what: 'An interactive dashboard built with React and Recharts over REST APIs and a SQL database, presenting production metrics, model-wise production views and operational reports.',
    problem: 'Production numbers that live in tables are slow to read and easy to misread when decisions depend on them.',
    usage: 'Internal production, engineering and management teams read production metrics and operational reports from database-driven, interactive charts.',
    built: ['Database-driven charts', 'Production metrics', 'Model-wise production visualisation', 'API integration', 'Interactive dashboards', 'Operational reporting'],
    tech: ['React', 'Recharts', 'REST APIs', 'SQL'],
    contributors: [],
    featured: false,
  },
  {
    id: 'devops-framework',
    title: 'Custom DevOps Automation Framework',
    lines: ['DevOps', 'Framework'],
    group: 'production',
    category: ['DevOps', 'Automation'],
    status: 'Internal implementation',
    shape: 'triangle',
    accent: 'red',
    theme: 'yellow',
    summary: 'From a developer’s commit to a Kubernetes deployment without a manual step.',
    what: 'A delivery framework that takes a developer’s commit from Git through Jenkins, builds it, packages it as a Docker image and deploys it to Kubernetes on Linux, scripted end to end.',
    problem: 'Manual deployment is slow, depends on whoever knows the steps and fails differently each time.',
    usage: 'Developers push to Git and the framework handles the rest, so every release follows the same repeatable, automated path.',
    built: ['Jenkins pipeline', 'Docker builds', 'Kubernetes deployment', 'Shell automation'],
    tech: ['Jenkins', 'Docker', 'Kubernetes', 'Linux', 'Shell scripting', 'Git'],
    flow: ['Developer', 'Git', 'Jenkins', 'Build', 'Docker', 'Kubernetes', 'Deployment'],
    contributors: SAURABH('Delivery framework'),
    featured: false,
  },

  // --------------------------------------------------------- Software / experiments
  {
    id: 'raasta',
    title: 'Raasta',
    lines: ['Raasta'],
    group: 'software',
    category: ['Education', 'Algorithm visualiser'],
    status: 'Software project',
    shape: 'circle',
    accent: 'yellow',
    theme: 'ink',
    summary: 'A path-finding algorithm visualiser: watch BFS, DFS and Dijkstra search a grid.',
    what: 'An interactive path-finding visualiser built in React. It animates Breadth-First Search, Depth-First Search and Dijkstra’s algorithm as they explore a grid and find a route.',
    problem: 'Graph algorithms are easy to recite and hard to picture; the difference between them only becomes obvious when you watch them search.',
    usage: 'It is used as a learning tool: run the algorithms side by side and see how each one explores and which path it finds.',
    built: ['Interactive visualiser', 'BFS, DFS and Dijkstra implementations'],
    tech: ['React.js', 'JavaScript', 'Algorithms', 'Data structures'],
    contributors: [],
    featured: false,
  },
  {
    id: 'github-dashboard',
    title: 'GitHub Information Dashboard',
    lines: ['GitHub', 'Dashboard'],
    group: 'software',
    category: ['Web application', 'Data visualisation'],
    status: 'Software project',
    shape: 'square',
    accent: 'blue',
    theme: 'ink',
    summary: 'GitHub profile and repository data, fetched live and drawn as charts.',
    what: 'A React dashboard that retrieves information from the GitHub APIs and presents it interactively with Chart.js visualisations, deployed on Netlify.',
    problem: 'GitHub shows activity as lists; seeing the shape of a profile or its repositories at a glance needs the data pulled together and charted.',
    usage: 'Visitors look up GitHub information and read it as interactive charts rather than raw lists.',
    built: ['GitHub API integration', 'Interactive presentation', 'Chart visualisations', 'Netlify deployment'],
    tech: ['React.js', 'Chart.js', 'GitHub APIs', 'Netlify'],
    contributors: [],
    featured: false,
  },
  {
    id: 'jarvis',
    title: 'J.A.R.V.I.S AI Assistant',
    lines: ['J.A.R.V.I.S'],
    group: 'software',
    category: ['AI', 'Assistant'],
    status: 'Software project',
    shape: 'triangle',
    accent: 'red',
    theme: 'ink',
    summary: 'A conversational AI assistant: a machine-learning exploration with a real interface and storage.',
    what: 'An AI assistant with a conversational interface: a Python and machine-learning back end, a React front end and SQL for persisting data.',
    problem: 'Exploring machine learning is most useful when it is wired into something people can talk to, with the front end, back end and data connected.',
    usage: 'It serves as an exploration of AI-assisted interaction, from the conversation in the browser through the model to stored data.',
    built: ['Conversational interface', 'Machine-learning exploration', 'Front-end and back-end integration', 'Data persistence'],
    tech: ['Python', 'Machine learning', 'React.js', 'SQL'],
    contributors: [],
    featured: false,
  },

  // ---------------------------------------------------------------- Current initiative
  {
    id: 'agency',
    title: 'IT Services Agency',
    lines: ['IT Services', 'Agency'],
    group: 'initiative',
    category: ['Current initiative', 'Services'],
    status: 'Current initiative',
    shape: 'square',
    accent: 'ink',
    theme: 'yellow',
    summary: 'The direction the work is heading: one team from development to support.',
    what:
      'A services practice being built around the full life of a system: development, cloud, deployment, security, monitoring, maintenance and support. It is a current initiative, not a completed client project.',
    problem:
      'Businesses often hire one party to build, another to host and nobody to maintain. Gaps between them are where outages, security issues and stalled projects come from.',
    usage:
      'It shapes how new work is taken on: cloud and infrastructure, DevOps, software, and infrastructure operations offered together, with documentation and handover as part of the job.',
    built: [],
    tech: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', '.NET / C#', 'React', 'Node.js', 'Next.js', 'Linux'],
    flow: ['Development', 'Cloud', 'Deployment', 'Security', 'Monitoring', 'Maintenance', 'Support'],
    contributors: [],
    featured: false,
  },
];

/** Service areas of the current initiative, as the source lists them. */
export const initiativeAreas: { title: string; items: string[] }[] = [
  { title: 'Cloud & infrastructure', items: ['AWS', 'Server deployment', 'Cloud migration', 'DNS / domain management', 'SSL/TLS', 'Infrastructure automation'] },
  { title: 'DevOps', items: ['Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Terraform', 'Monitoring', 'Production operations'] },
  { title: 'Software', items: ['.NET / C#', 'React', 'Node.js', 'Next.js', 'REST APIs', 'Database development'] },
  { title: 'Infrastructure operations', items: ['Linux', 'Application deployment', 'Database management', 'Monitoring', 'Troubleshooting', 'Documentation', 'Handover'] },
];

/** The operating portfolio: environments run in production, not projects of their own. */
export const operatingPortfolio = {
  environments: '80+',
  statement: 'Infrastructure operations cover 80+ live public-facing production environments.',
  groups: [
    { title: 'Corporate / real estate', domains: ['ccsinfratech.com', 'aijr.org'] },
    {
      title: 'Travel / aviation',
      domains: ['flyntickets.com', 'cheapcruisefare.com', 'cruisesfares.com', 'lowfareoffers.com', 'lowflyfare.com', 'booklowfareflight.com'],
    },
  ],
  more: 'Plus dozens of additional active domains across B2B clients and specialized hosting environments.',
};

export const GROUPS: { id: ProjectGroup; title: string; note: string }[] = [
  { id: 'client', title: 'Client work', note: 'Live websites and platforms for clients.' },
  { id: 'flagship', title: 'Flagship engineering', note: 'The largest systems: infrastructure, migration, observability, cost and analytics.' },
  { id: 'production', title: 'Production implementations', note: 'Infrastructure, delivery, data and application work running in production.' },
  { id: 'software', title: 'Software / experiments', note: 'Projects built to learn, explore and show how things work.' },
  { id: 'initiative', title: 'Current initiative', note: 'What is being built now. Not a completed project.' },
];

export const featuredProjects = projects.filter((p) => p.featured);
/** Completed and running work: everything except the current initiative. */
export const workProjects = projects.filter((p) => p.group !== 'initiative');
/** The dedicated Projects page (a second Vite entry). */
export const PROJECTS_PAGE = 'projects.html';
/** Display number within a list, e.g. "02". */
export const projectNo = (list: readonly Project[], p: Project): string => String(list.indexOf(p) + 1).padStart(2, '0');

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
    accent: 'ink',
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
    accent: 'paper',
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
    body: { count: projects.length, items: projects.map((p) => p.id) },
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
