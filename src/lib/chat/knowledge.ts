import {
  education,
  experience,
  featuredProjects,
  labProjects,
  moreBuilds,
  profile,
  skillGroups,
  stats,
  type Project,
} from "@/data/profile";
import type { BotReply, ChatLink } from "./types";

// Everything the assistant says is built from src/data/profile.ts, so the
// answers always match the site. The assistant refers to Asadullah by name.

const NAME = profile.firstName;
const bullet = (items: string[]) => items.map((i) => `• ${i}`).join("\n");
const statLine = (label: string) => {
  const s = stats.find((x) => x.label.toLowerCase().includes(label));
  return s ? `${s.value.toLocaleString("en-US")}${s.suffix}` : "";
};

export const links = {
  email: { label: "Email", href: `mailto:${profile.email}` },
  linkedin: { label: "LinkedIn", href: profile.socials.linkedin },
  github: { label: "GitHub", href: profile.socials.github },
  cv: { label: "Download CV", href: profile.cv },
  projects: { label: "See projects", href: "/#projects" },
  experience: { label: "Experience", href: "/#experience" },
  skills: { label: "Skills", href: "/#skills" },
  lab: { label: "AI Lab", href: "/#lab" },
  contact: { label: "Contact", href: "/#contact" },
} satisfies Record<string, ChatLink>;

export const starterSuggestions = [
  `What has ${NAME} built?`,
  "What are the main skills?",
  "Tell me about the AI teaching",
  "Is Asadullah available for hire?",
];

// ---------------------------------------------------------------------------
// Intents: keyword triggers + a reply builder
// ---------------------------------------------------------------------------

export type Intent = {
  id: string;
  /** Single words (matched after light stemming, typo-tolerant) */
  keywords: string[];
  /** Multi-word phrases (matched as substrings, weigh more) */
  phrases?: string[];
  reply: () => BotReply;
};

export const intents: Intent[] = [
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "salam", "assalamualaikum", "aoa", "yo", "hola"],
    phrases: ["good morning", "good evening", "good afternoon"],
    reply: () => ({
      text: `Hi! 👋 I'm ${NAME}'s portfolio assistant. Ask me about ${NAME}'s projects, skills, experience, AI teaching, or how to get in touch.`,
      suggestions: starterSuggestions,
    }),
  },
  {
    id: "about",
    keywords: ["who", "about", "introduce", "introduction", "background", "summary", "bio", "profile", "overview"],
    phrases: ["tell me about", "who is", "who are", "about him", "about asadullah", "what does he do", "what do you do"],
    reply: () => ({
      text: `${profile.name} is a ${profile.roles.join(", ").replace(/, ([^,]*)$/, " and $1")}. ${NAME} works at Dollar Tech as a Software Engineer & SEO Expert and is studying Computer Science at ${education.school} (${education.period.toLowerCase()}).\n\nHighlights:\n${bullet(
        stats.map((s) => `${s.value.toLocaleString("en-US")}${s.suffix} ${s.label.toLowerCase()}`),
      )}\n\n${profile.tagline.replace("I build", `${NAME} builds`)}`,
      links: [links.projects, links.cv],
      suggestions: [`What has ${NAME} built?`, "What are the main skills?", "How can I contact Asadullah?"],
    }),
  },
  {
    id: "skills",
    keywords: ["skill", "skills", "stack", "technology", "technologies", "tech", "tools", "know", "expertise", "good", "strengths", "specialty"],
    phrases: ["tech stack", "what can", "good at", "work with"],
    reply: () => ({
      text: `${NAME}'s skills, grouped the same way as the network in the hero:\n\n${bullet(
        skillGroups.map((g) => `${g.label}: ${g.skills.join(", ")}`),
      )}`,
      links: [links.skills],
      suggestions: ["Tell me about the AI skills", "What about SEO?", `What has ${NAME} built?`],
    }),
  },
  {
    id: "projects",
    keywords: ["project", "projects", "built", "build", "portfolio", "made", "created", "products", "apps", "websites", "work", "examples"],
    phrases: ["what has", "what did", "show me"],
    reply: () => ({
      text: `${NAME}'s featured projects are all live products:\n\n${bullet(
        featuredProjects.map((p) => `${p.name}: ${p.tagline}`),
      )}\n\nThere are also ${labProjects.length} AI projects in the AI Lab and ${moreBuilds.length} more builds on GitHub (C++, systems and data structures).`,
      links: [links.projects, links.github],
      suggestions: featuredProjects.slice(0, 3).map((p) => `Tell me about ${p.name}`),
      topic: "projects",
    }),
  },
  {
    id: "experience",
    keywords: ["experience", "job", "jobs", "career", "company", "employer", "worked", "working", "role", "position", "current", "currently"],
    phrases: ["where does", "where do", "work experience", "dollar tech"],
    reply: () => ({
      text: `${NAME}'s experience:\n\n${experience
        .map((j) => `• ${j.role}, ${j.company} (${j.period})\n  ${j.points[0]}`)
        .join("\n")}`,
      links: [links.experience, links.cv],
      suggestions: ["Tell me about the AI teaching", "Is Asadullah available for hire?"],
    }),
  },
  {
    id: "ai",
    keywords: ["ai", "artificial", "intelligence", "chatgpt", "gpt", "claude", "llm", "llms", "prompt", "prompting", "ml", "machine", "learning", "agent", "agents", "automation", "automate", "n8n"],
    phrases: ["machine learning", "prompt engineering", "ai agents"],
    reply: () => {
      const ai = skillGroups.find((g) => g.id === "ai");
      return {
        text: `${NAME} uses AI in real work and teaches it:\n\n${bullet([
          ...(ai ? [`Skills: ${ai.skills.join(", ")}`] : []),
          `Trained ${statLine("trained")} students and business owners to use AI`,
          `AI projects: ${labProjects.map((p) => p.name).join(", ")}`,
        ])}`,
        links: [links.lab, links.experience],
        suggestions: ["Tell me about the AI teaching", "Tell me about the Wumpus Logic Agent"],
      };
    },
  },
  {
    id: "teaching",
    keywords: ["teach", "teaching", "taught", "course", "courses", "students", "trained", "training", "instructor", "workshop", "class", "classes", "mentor"],
    reply: () => {
      const job = experience.find((j) => j.video) ?? experience.find((j) => /instructor/i.test(j.role));
      return {
        text: `${NAME} is an AI Instructor at Dollar Tech:\n\n${bullet(job?.points ?? [])}\n\nThere's a video of a real teaching session in the Experience section.`,
        links: [links.experience],
        suggestions: ["What AI tools does Asadullah use?", "Is Asadullah available for hire?"],
      };
    },
  },
  {
    id: "seo",
    keywords: ["seo", "ranking", "rank", "google", "search", "keyword", "keywords", "traffic", "organic", "vitals", "schema", "serp", "ahrefs", "semrush"],
    phrases: ["core web vitals", "search engine"],
    reply: () => {
      const seo = skillGroups.find((g) => g.id === "seo");
      const job = experience[0];
      return {
        text: `SEO is one of ${NAME}'s core specialties. At Dollar Tech, ${NAME} owns SEO across in-house properties: technical audits, on-page optimization, keyword research, schema, sitemaps and Core Web Vitals.\n\n${
          seo ? `Tools & skills: ${seo.skills.join(", ")}` : ""
        }\n\nThis portfolio is built SEO-first too: structured data, a sitemap and fast-loading pages.`,
        links: [links.skills, ...(job ? [links.experience] : [])],
        suggestions: ["Tell me about Query Finder", "Tell me about The Dollar Tech"],
      };
    },
  },
  {
    id: "education",
    keywords: ["education", "university", "uni", "degree", "college", "fast", "nuces", "study", "studying", "student", "graduate", "graduation", "bscs", "cs", "semester", "coursework"],
    reply: () => ({
      text: `${NAME} is studying for a ${education.degree} at ${education.school} (${education.schoolFull}), ${education.period.toLowerCase()}.\n\nCoursework includes ${education.coursework.join(", ")}.`,
      suggestions: ["What are the main skills?", `What has ${NAME} built?`],
    }),
  },
  {
    id: "hire",
    keywords: ["hire", "hiring", "available", "availability", "freelance", "freelancer", "fulltime", "internship", "intern", "contract", "rate", "rates", "price", "pricing", "cost", "charge", "budget", "opportunity", "opportunities", "recruit", "recruiting"],
    phrases: ["full time", "full-time", "open to", "work together", "work with you", "how much"],
    reply: () => ({
      text: `${NAME} is ${profile.availability.toLowerCase()}.\n\nPricing depends on the scope of the project. The best next step is a short email describing what you need, and ${NAME} will get back to you.`,
      links: [links.email, links.linkedin, links.cv],
      suggestions: [`What has ${NAME} built?`, "What are the main skills?"],
    }),
  },
  {
    id: "contact",
    keywords: ["contact", "email", "mail", "reach", "linkedin", "github", "message", "connect", "phone", "number", "whatsapp", "call", "touch"],
    phrases: ["get in touch", "reach out"],
    reply: () => ({
      text: `The best way to reach ${NAME} is by email: ${profile.email}\n\nYou can also connect on LinkedIn or see the code on GitHub. A phone number isn't shared publicly, so email is the quickest route.`,
      links: [links.email, links.linkedin, links.github],
      suggestions: ["Is Asadullah available for hire?", "Can I see the CV?"],
    }),
  },
  {
    id: "cv",
    keywords: ["cv", "resume", "résumé", "pdf"],
    reply: () => ({
      text: `Here's ${NAME}'s CV. It covers experience at Dollar Tech, live projects, technical skills and education.`,
      links: [links.cv],
      suggestions: ["How can I contact Asadullah?", "What are the main skills?"],
    }),
  },
  {
    id: "location",
    keywords: ["where", "location", "located", "based", "country", "city", "live", "lives", "timezone", "remote", "relocate"],
    phrases: ["based in", "where is", "where are"],
    reply: () => ({
      text: `${NAME} is based in Pakistan and works with clients worldwide, remotely.`,
      links: [links.contact],
      suggestions: ["Is Asadullah available for hire?"],
    }),
  },
  {
    id: "scraping",
    keywords: ["scrape", "scraping", "scraper", "crawler", "crawling", "extraction", "extract", "reddit", "forum", "forums", "data"],
    phrases: ["data scraping", "web scraping"],
    reply: () => {
      const qf = featuredProjects.find((p) => p.slug === "query-finder");
      const data = skillGroups.find((g) => g.id === "data");
      return {
        text: `${NAME} builds data-scraping tools. ${qf ? `The main one is ${qf.name}: ${qf.description}` : ""}\n\n${data ? `${data.label} skills: ${data.skills.join(", ")}` : ""}`,
        links: qf ? [{ label: `${qf.name} case study`, href: `/projects/${qf.slug}` }] : [links.projects],
        suggestions: ["What about SEO?", `What has ${NAME} built?`],
      };
    },
  },
  {
    id: "blog",
    keywords: ["blog", "blogs", "article", "articles", "post", "posts", "writing", "writes", "write", "read"],
    phrases: ["case study", "write about"],
    reply: () => ({
      text: `${NAME} writes about how real products get built: the 3D neural network on this site, debugging an AI logic agent, self-hosting Next.js, and more. Each post covers the bugs, trade-offs and numbers behind the work.`,
      links: [{ label: "Read the blog", href: "/blog" }],
      suggestions: [`What has ${NAME} built?`, "Tell me about the AI teaching"],
    }),
  },
  {
    id: "site",
    keywords: ["site", "website", "portfolio", "threejs", "three", "3d", "animation", "animations", "gsap", "neural"],
    phrases: ["this site", "this website", "this portfolio", "how was this", "how is this", "built this", "made this"],
    reply: () => ({
      text: `${NAME} built this portfolio with Next.js and React, Three.js (React Three Fiber) for the 3D neural network, GSAP and Lenis for the scroll animations, and Tailwind CSS. It's self-hosted on a VPS.\n\nThe hero network maps ${NAME}'s six skill clusters, with Full-Stack at the core.`,
      links: [links.github],
      suggestions: ["What are the main skills?", `What has ${NAME} built?`],
    }),
  },
  {
    id: "bot",
    keywords: ["bot", "chatbot", "robot", "human", "real", "assistant"],
    phrases: ["are you", "who are you", "what are you", "are you ai", "are you real"],
    reply: () => ({
      text: `I'm a lightweight assistant ${NAME} built for this site. I answer from the portfolio's own content, right in your browser, so nothing you type is sent anywhere.\n\nFor anything I can't answer, email ${NAME} directly.`,
      links: [links.email],
      suggestions: starterSuggestions.slice(0, 3),
    }),
  },
  {
    id: "thanks",
    keywords: ["thanks", "thank", "thx", "ty", "great", "awesome", "cool", "nice", "perfect", "helpful"],
    reply: () => ({
      text: "You're welcome! Anything else you'd like to know?",
      suggestions: starterSuggestions,
    }),
  },
  {
    id: "bye",
    keywords: ["bye", "goodbye", "later", "cya"],
    phrases: ["see you"],
    reply: () => ({
      text: `Thanks for stopping by! If you'd like to work together, ${NAME}'s inbox is open.`,
      links: [links.email],
    }),
  },
];

// ---------------------------------------------------------------------------
// Entities: specific projects and skills mentioned by name
// ---------------------------------------------------------------------------

const PROJECT_ALIASES: Record<string, string[]> = {
  "cpc-point": ["cpc point", "cpcpoint", "cpc", "ad network", "adnetwork"],
  "the-dollar-tech": ["the dollar tech", "dollar tech", "dollartech", "thedollartech", "tools hub"],
  "query-finder": ["query finder", "queryfinder"],
  "puns-now": ["puns now", "punsnow", "puns", "pun generator"],
  "wumpus-logic-agent": ["wumpus"],
  "dynamic-pathfinding-agent": ["pathfinding", "path finding"],
  "smart-campus-ai-pipeline": ["smart campus"],
  "multi-campus-communication": ["multi campus", "communication system"],
  "core-banking-system": ["banking"],
  "pokec-social-network": ["pokec", "social network"],
  "event-finder": ["eventfinder", "event finder"],
  "pacman-oop": ["pacman", "pac man"],
  "cookie-crush": ["cookie crush", "candy crush"],
};

export const allProjects: Project[] = [...featuredProjects, ...labProjects, ...moreBuilds];

export const projectAliases = allProjects.map((p) => ({
  project: p,
  aliases: PROJECT_ALIASES[p.slug] ?? [p.name.toLowerCase()],
}));

const SKILL_ALIASES: Record<string, string[]> = {
  React: ["react", "reactjs"],
  "Next.js": ["next", "nextjs", "next js"],
  "Node.js": ["node", "nodejs", "node js"],
  Express: ["express", "expressjs"],
  TypeScript: ["typescript", "ts"],
  JavaScript: ["javascript", "js"],
  "Tailwind CSS": ["tailwind"],
  PHP: ["php"],
  Python: ["python"],
  "C++": ["c++", "cpp", "c plus plus"],
  SQL: ["sql"],
  PostgreSQL: ["postgres", "postgresql", "psql"],
  MongoDB: ["mongo", "mongodb"],
  MySQL: ["mysql"],
  "REST APIs": ["rest", "api", "apis"],
  "Real-Time Bidding": ["rtb", "real time bidding"],
  "Google AdSense": ["adsense"],
};

export const skillAliases = skillGroups.flatMap((g) =>
  g.skills.map((skill) => ({
    skill,
    group: g,
    aliases: SKILL_ALIASES[skill] ?? [skill.toLowerCase()],
  })),
);

// MERN is asked about often enough to answer directly
export const MERN = ["MongoDB", "Express", "React", "Node.js"];

export function projectReply(p: Project): BotReply {
  const featured = featuredProjects.includes(p);
  const live = p.url && !p.offline;
  const projectLinks: ChatLink[] = [];
  if (featured) projectLinks.push({ label: "Read case study", href: `/projects/${p.slug}` });
  if (live) projectLinks.push({ label: `Visit ${new URL(p.url!).hostname}`, href: p.url! });
  if (p.repo) projectLinks.push({ label: "View source", href: p.repo });

  const parts = [`${p.name}: ${p.tagline}.`];
  if (p.description) parts.push(p.description);
  if (p.highlights.length) parts.push(bullet(p.highlights.slice(0, 4)));
  if (p.metrics) parts.push(`Numbers: ${p.metrics.map((m) => `${m.value} ${m.label}`).join(" · ")}`);
  parts.push(`Focus: ${p.tech.join(", ")}`);
  if (p.offline) parts.push("(The site is temporarily offline.)");

  const others = featuredProjects.filter((x) => x !== p).slice(0, 2);
  return {
    text: parts.join("\n\n"),
    links: projectLinks,
    suggestions: [...others.map((x) => `Tell me about ${x.name}`), `What has ${NAME} built?`],
    topic: `project:${p.slug}`,
  };
}

export function skillReply(found: { skill: string; group: { label: string; skills: string[] } }[]): BotReply {
  const names = [...new Set(found.map((f) => f.skill))];
  const groups = [...new Set(found.map((f) => f.group.label))];
  const related = allProjects
    .filter((p) => p.tech.some((t) => names.some((n) => t.toLowerCase().includes(n.toLowerCase()))))
    .slice(0, 3);
  const list = names.length > 1 ? names.slice(0, -1).join(", ") + " and " + names.at(-1) : names[0];
  return {
    text: `Yes, ${NAME} works with ${list}, part of the ${groups.join(" and ")} skill set${groups.length > 1 ? "s" : ""}.${
      related.length ? `\n\nYou can see it in: ${related.map((p) => p.name).join(", ")}.` : ""
    }\n\nOther ${found[0].group.label} skills: ${found[0].group.skills.filter((s) => !names.includes(s)).join(", ")}.`,
    links: [links.skills, ...related.filter((p) => featuredProjects.includes(p)).slice(0, 1).map((p) => ({ label: `${p.name} case study`, href: `/projects/${p.slug}` }))],
    suggestions: ["What are the main skills?", `What has ${NAME} built?`],
  };
}

export const fallbackReply = (): BotReply => ({
  text: `I'm not sure about that one. I only know about ${NAME}'s work, skills and experience. Try one of the questions below, or email ${NAME} directly.`,
  links: [links.email],
  suggestions: starterSuggestions,
});
