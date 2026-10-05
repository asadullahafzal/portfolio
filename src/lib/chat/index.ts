import { answer } from "./localEngine";
import type { BotReply, ChatMessage } from "./types";

export type { BotReply, ChatLink, ChatMessage } from "./types";
export { starterSuggestions } from "./knowledge";

/**
 * Single entry point the chat widget calls.
 *
 * Today it answers locally from the portfolio data, with no API key and no
 * network. To switch to an LLM later, replace the body with a call to an API
 * route (e.g. `fetch("/api/chat", { method: "POST", body: JSON.stringify({ history }) })`)
 * that returns the same `BotReply` shape. The widget doesn't need to change.
 */
export async function getReply(question: string, history: ChatMessage[]): Promise<BotReply> {
  const lastBot = [...history].reverse().find((m) => m.role === "bot");
  return answer(question, lastBot?.role === "bot" ? lastBot.topic : undefined);
}

// Lets any button on the site open the chat (optionally asking a question).
export const OPEN_CHAT_EVENT = "portfolio:open-chat";
export function openChat(question?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT, { detail: { question } }));
}
