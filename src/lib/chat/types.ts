// Shared chat types. The widget only depends on these and on `getReply`
// (see ./index.ts), so the answering engine can be swapped for an LLM later
// without touching the UI.

export type ChatLink = { label: string; href: string };

export type BotReply = {
  text: string;
  links?: ChatLink[];
  /** Follow-up questions offered as chips under the reply */
  suggestions?: string[];
  /** What the reply was about, so "tell me more" can follow up */
  topic?: string;
};

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | ({ id: string; role: "bot" } & BotReply);
