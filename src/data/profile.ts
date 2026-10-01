// Single source of truth for all site content.
// The page sections, the 3D neural hero and the "Ask my AI" bot all read from here,
// so updating a fact in this file updates it everywhere.

export const site = {
  url: "https://asadullahafzal.com",
  name: "Asadullah Afzal",
  title: "Asadullah Afzal — Full-Stack Engineer, SEO Expert & AI Educator",
  description:
    "Full-stack engineer and SEO expert building live products that ship, rank and scale — from a real-time ad network serving 50M+ impressions a month to AI education for 200+ learners.",
};

export const profile = {
  name: "Asadullah Afzal",
  firstName: "Asadullah",
  roles: ["Full-Stack Engineer", "SEO Expert", "AI Educator"],
  tagline: "I build products that ship, rank, and scale.",
  summary:
    "Computer Science undergraduate at FAST-NUCES and Software Engineer + SEO Expert at Dollar Tech. I ship and operate live products across ad-tech, SEO tooling and content — from a real-time bidding ad network serving 50M+ impressions a month to a suite of free web tools for creators. I've also trained 200+ students and business owners to put AI to work.",
  email: "asadullahafzal840@gmail.com",
  availability: "Open to freelance projects and full-time opportunities",
  photo: "/images/asadullah-dollar-tech.jpg",
  cv: "/Asadullah_Afzal_CV.pdf",
  socials: {
    linkedin: "https://www.linkedin.com/in/asadullah-afzal-4450261ba",
    github: "https://github.com/asadullahafzal",
  },
};

export type Stat = { value: number; suffix: string; label: string };

export const stats: Stat[] = [
  { value: 50, suffix: "M+", label: "Ad impressions served monthly" },
  { value: 1200, suffix: "+", label: "Publishers on CPC Point" },
  { value: 60, suffix: "+", label: "Countries reached" },
  { value: 200, suffix: "+", label: "People trained in AI" },
];

export const education = {
  degree: "Bachelor of Science in Computer Science",
  school: "FAST-NUCES",
  schoolFull: "National University of Computer & Emerging Sciences",
  period: "In progress · Graduating 2027",
  coursework: [
    "Data Structures & Algorithms",
    "Object-Oriented Programming",
    "Databases",
    "Operating Systems",
    "Web Engineering",
    "Software Engineering",
  ],
};

// `id` doubles as the neuron-cluster id in the 3D hero.
export type SkillGroup = { id: string; label: string; skills: string[] };

export const skillGroups: SkillGroup[] = [
  {
    id: "fullstack",
    label: "Full-Stack",
    skills: ["React", "Next.js", "Node.js", "Express", "TypeScript", "Tailwind CSS", "PHP", "REST APIs"],
  },
  {
    id: "ai",
    label: "AI & Automation",
    skills: ["ChatGPT & Claude", "Prompt Engineering", "n8n AI Agents", "Python ML", "AI Education"],
  },
  {
    id: "seo",
    label: "SEO & Growth",
    skills: ["Technical SEO", "Schema / Structured Data", "Core Web Vitals", "Keyword Research", "Search Console", "Ahrefs & SEMrush"],
  },
  {
    id: "data",
    label: "Data",
    skills: ["PostgreSQL", "MongoDB", "MySQL"],
  },
  {
    id: "languages",
    label: "Languages",
    skills: ["JavaScript", "TypeScript", "Python", "C++", "SQL"],
  },
  {
    id: "adtech",
    label: "Ad-Tech",
    skills: ["Real-Time Bidding", "Ad-Serving Pipelines", "CPC / CPM / CPA Models", "Google AdSense", "Invalid-Traffic Handling"],
  },
];

export type Experience = {
  role: string;
  company: string;
  period: string;
  points: string[];
  video?: string;
};

export const experience: Experience[] = [
  {
    role: "Software Engineer & SEO Expert",
    company: "Dollar Tech",
    period: "Present",
    points: [
      "Design and develop full-stack web applications end-to-end: front-end UI, back-end APIs, real-time dashboards and database design.",
      "Own SEO across in-house properties: technical audits, on-page optimization, keyword research, schema, sitemaps and Core Web Vitals.",
      "Ship features, resolve bugs and manage production deployments; collaborate on product direction and growth.",
    ],
  },
  {
    role: "AI Instructor",
    company: "Dollar Tech",
    period: "Present",
    points: [
      "Trained 200+ students and business owners to use AI in real work.",
      "Taught ChatGPT & Claude workflows, prompt engineering and automation with n8n AI agents.",
    ],
    video: "/videos/ai-teaching.mp4",
  },
  {
    role: "Freelance Full-Stack Developer",
    company: "Independent · via LinkedIn",
    period: "Ongoing",
    points: [
      "Deliver web applications, SEO and automation services to clients worldwide.",
    ],
  },
];

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  url?: string;
  repo?: string;
  role?: string;
  description: string;
  highlights: string[];
  tech: string[];
  metrics?: { value: string; label: string }[];
};

export const featuredProjects: Project[] = [
  {
    slug: "cpc-point",
    name: "CPC Point",
    tagline: "Premium global ad network for publishers",
    url: "https://cpcpoint.com",
    role: "Full-Stack Developer",
    description:
      "A live ad-tech platform connecting publishers with global brand demand, with real-time auctions, transparent earnings and reliable payouts.",
    highlights: [
      "Real-time bidding auction resolving in ~40ms per impression",
      "One-line embed tag for publishers",
      "Publisher & advertiser dashboards with real-time reporting",
      "Transparent revenue ledger",
      "Multi-method payouts: Bank, Wise, Payoneer, USDT",
    ],
    tech: ["Full-Stack", "Real-Time Bidding", "Dashboards", "Payments"],
    metrics: [
      { value: "50M+", label: "impressions / month" },
      { value: "1,200+", label: "publishers" },
      { value: "60+", label: "countries" },
      { value: "~40ms", label: "per auction" },
    ],
  },
  {
    slug: "the-dollar-tech",
    name: "The Dollar Tech",
    tagline: "Free web-tools hub for bloggers, creators & SEOs",
    url: "https://thedollartech.tech",
    role: "Built & maintain",
    description:
      "A suite of fast, no-signup browser tools with an SEO-first architecture and a companion blog on SEO and content growth.",
    highlights: [
      "Query Finder for low-competition keyword research",
      "Blog Outline Generator, Meta Tag & OG Preview, Ad Revenue (RPM) Estimator",
      "Word Counter, Slug Generator, UTM Link Builder, Case Converter and more",
      "Own site architecture, SEO structure and technical performance",
    ],
    tech: ["Next.js", "React", "Technical SEO", "Core Web Vitals"],
  },
  {
    slug: "puns-now",
    name: "Puns Now",
    tagline: "Puns-niche content site with in-house generators",
    url: "https://punsnow.com",
    role: "Built & manage",
    description:
      "An SEO-first content site monetized with AdSense, with interactive generators that drive organic traffic.",
    highlights: [
      "Pun Generator, Name Pun Generator, Team Name Generator, Elf Name Generator",
      "Valentine's Cards Maker",
      "Content strategy across food, animal, holiday, sports and seasonal categories",
    ],
    tech: ["WordPress", "SEO", "AdSense", "Content Strategy"],
  },
];

export const labProjects: Project[] = [
  {
    slug: "wumpus-logic-agent",
    name: "Wumpus Logic Agent",
    tagline: "Knowledge-based agent that reasons its way through the Wumpus World",
    repo: "https://github.com/asadullahafzal/wumpus-logic-agent",
    description: "A logical agent that infers safe cells from percepts using propositional reasoning.",
    highlights: [],
    tech: ["JavaScript", "Logic", "AI Agents"],
  },
  {
    slug: "dynamic-pathfinding-agent",
    name: "Dynamic Pathfinding Agent",
    tagline: "Search agent that re-plans as the world changes",
    repo: "https://github.com/asadullahafzal/Dynamic-Pathfinding-Agent",
    description: "Pathfinding with informed search that adapts when obstacles appear.",
    highlights: [],
    tech: ["Python", "Search Algorithms", "AI"],
  },
  {
    slug: "smart-campus-ai-pipeline",
    name: "Smart Campus AI Pipeline",
    tagline: "End-to-end AI pipeline for campus data",
    repo: "https://github.com/asadullahafzal/Smart-Campus-AI-pipeline",
    description: "A Python data and ML pipeline built for a smart-campus scenario.",
    highlights: [],
    tech: ["Python", "Machine Learning", "Data Pipelines"],
  },
];

export const moreBuilds: Project[] = [
  {
    slug: "multi-campus-communication",
    name: "Multi-Campus Communication System",
    tagline: "Client–server messaging across a distributed campus network",
    repo: "https://github.com/asadullahafzal/Multi-Campus-Communication-System",
    description: "",
    highlights: [],
    tech: ["C++", "Networking"],
  },
  {
    slug: "core-banking-system",
    name: "Core Banking System",
    tagline: "Accounts, transactions and ledgers",
    repo: "https://github.com/asadullahafzal/Core-Banking-System",
    description: "",
    highlights: [],
    tech: ["Databases", "Systems"],
  },
  {
    slug: "pokec-social-network",
    name: "Pokec Social Network Analysis",
    tagline: "Graph analysis on a 1.6M-user social network",
    repo: "https://github.com/asadullahafzal/Pokec-Social-Network",
    description: "",
    highlights: [],
    tech: ["C++", "Graphs", "Data Structures"],
  },
  {
    slug: "event-finder",
    name: "EventFinder",
    tagline: "Discover events near you",
    repo: "https://github.com/asadullahafzal/EventFinder",
    description: "",
    highlights: [],
    tech: ["JavaScript"],
  },
  {
    slug: "pacman-oop",
    name: "Pacman (OOP)",
    tagline: "Console Pacman built on OOP principles",
    repo: "https://github.com/asadullahafzal/Pacman-using-OOP",
    description: "",
    highlights: [],
    tech: ["C++", "OOP"],
  },
  {
    slug: "cookie-crush",
    name: "Cookie Crush",
    tagline: "Match-3 puzzle game",
    repo: "https://github.com/asadullahafzal/Cookie-Crush",
    description: "",
    highlights: [],
    tech: ["C++", "Game Logic"],
  },
];

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#lab", label: "AI Lab" },
  { href: "#contact", label: "Contact" },
];
