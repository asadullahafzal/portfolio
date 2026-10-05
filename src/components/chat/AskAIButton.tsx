"use client";

import { openChat } from "@/lib/chat";
import { ChatIcon } from "@/components/ui/Icons";

// Opens the chat widget from anywhere (usable inside server components).
export default function AskAIButton({ className = "btn btn-ghost", question }: { className?: string; question?: string }) {
  return (
    <button type="button" onClick={() => openChat(question)} className={className}>
      <ChatIcon width={16} height={16} /> Ask my AI
    </button>
  );
}
