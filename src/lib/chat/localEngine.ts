import { featuredProjects } from "@/data/profile";
import {
  MERN,
  allProjects,
  fallbackReply,
  intents,
  projectAliases,
  projectReply,
  skillAliases,
  skillReply,
} from "./knowledge";
import type { BotReply } from "./types";

// Key-free answering engine: scores the question against keyword intents
// (typo-tolerant), and detects projects/skills mentioned by name.

const normalize = (s: string) =>
  ` ${s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;

// Very light stemming so "projects"/"project", "teaching"/"teach" match
const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, (m) => (w.length - m.length >= 3 ? "" : m));

function editDistance(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

// Exact after stemming, or a small typo on longer words ("experiance", "skils")
function wordMatches(token: string, keyword: string) {
  const t = stem(token);
  const k = stem(keyword);
  if (t === k) return true;
  if (k.length >= 5 && t.length >= 4) return editDistance(t, k) <= (k.length >= 8 ? 2 : 1);
  return false;
}

// Alias match on whole words/phrases, so "ts" doesn't fire inside "skills"
const hasPhrase = (text: string, phrase: string) =>
  new RegExp(`(^|[\\s])${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([\\s.]|$)`).test(text.trim());

const FOLLOW_UP = /\b(more|details?|elaborate|explain|expand|else|continue|go on)\b/;

export function answer(question: string, lastTopic?: string): BotReply {
  const text = normalize(question);
  const tokens = text.trim().split(" ").filter(Boolean);

  // 1. A specific project mentioned by name wins
  const project = projectAliases.find(({ aliases }) => aliases.some((a) => hasPhrase(text, a)));
  // "Dollar Tech" alone usually means the company, unless they ask about the site/tools
  const meansCompany =
    project?.project.slug === "the-dollar-tech" && /\b(work|job|company|employ|role|teach|instructor|experi|career|position)|\bat (the )?dollar tech/.test(text) && !/\b(tool|site|website|hub|project)/.test(text);
  if (project && !meansCompany) return projectReply(project.project);

  // 2. "Tell me more" continues the previous topic
  if (FOLLOW_UP.test(text) && tokens.length <= 6 && lastTopic) {
    if (lastTopic.startsWith("project:")) {
      const p = allProjects.find((x) => `project:${x.slug}` === lastTopic);
      if (p?.caseStudy) {
        return {
          text: `${p.caseStudy.challenge}\n\nWhat was built:\n${p.caseStudy.approach.map((a) => `• ${a}`).join("\n")}`,
          links: [{ label: "Read the full case study", href: `/projects/${p.slug}` }],
          topic: lastTopic,
        };
      }
    }
    if (lastTopic === "projects") return projectReply(featuredProjects[0]);
  }

  // 3. Score keyword intents
  let best: { reply: () => BotReply; score: number } | null = null;
  for (const intent of intents) {
    let score = 0;
    for (const k of intent.keywords) if (tokens.some((t) => wordMatches(t, k))) score += 1;
    for (const p of intent.phrases ?? []) if (text.includes(` ${p} `) || text.includes(` ${p}`)) score += 2;
    if (score > (best?.score ?? 0)) best = { reply: intent.reply, score };
  }

  // 4. Specific skills / technologies ("does he know React?", "MERN?")
  const skills = skillAliases.filter(({ aliases }) => aliases.some((a) => hasPhrase(text, a)));
  if (/\bmern\b/.test(text)) {
    const mern = skillAliases.filter((s) => MERN.includes(s.skill));
    return skillReply(mern);
  }
  if (skills.length && (!best || best.score <= 2)) return skillReply(skills);

  if (best && best.score > 0) return best.reply();
  return fallbackReply();
}
