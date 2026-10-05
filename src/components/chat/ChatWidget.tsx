"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { getReply, OPEN_CHAT_EVENT, starterSuggestions, type BotReply, type ChatMessage } from "@/lib/chat";
import { ChatIcon, CloseIcon } from "@/components/ui/Icons";

const STORAGE_KEY = "portfolio-chat";
const MAX_LENGTH = 300;

const greeting: ChatMessage = {
  id: "greeting",
  role: "bot",
  text: "Hi! 👋 I'm Asadullah's portfolio assistant. Ask me anything about the projects, skills, experience or AI teaching.",
  suggestions: starterSuggestions,
};

let counter = 0;
const newId = () => `${Date.now().toString(36)}-${counter++}`;

// sessionStorage can be unavailable (private mode, blocked storage), so every access is guarded
function loadHistory(): ChatMessage[] {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as ChatMessage[];
  } catch {}
  return [greeting];
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  // The bot message currently being "typed out", and how much of it is visible
  const [streaming, setStreaming] = useState<{ id: string; shown: number } | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const messagesRef = useRef(messages);
  const busyRef = useRef(false);

  // Restore this tab's conversation after hydration
  useEffect(() => {
    const restored = loadHistory();
    messagesRef.current = restored;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from sessionStorage, which isn't available during SSR
    setMessages(restored);
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages]);

  // Keep the newest message in view
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, typing, streaming, open]);

  // Reveal the latest answer a few characters at a time
  useEffect(() => {
    if (!streaming) return;
    const msg = messages.find((m) => m.id === streaming.id);
    if (!msg || streaming.shown >= msg.text.length) {
      const done = setTimeout(() => setStreaming(null), 0);
      return () => clearTimeout(done);
    }
    const t = setTimeout(() => setStreaming({ id: streaming.id, shown: streaming.shown + 4 }), 12);
    return () => clearTimeout(t);
  }, [streaming, messages]);

  const send = useCallback(async (raw: string) => {
    const question = raw.trim().slice(0, MAX_LENGTH);
    if (!question || busyRef.current) return;
    busyRef.current = true;

    const history = messagesRef.current;
    const userMsg: ChatMessage = { id: newId(), role: "user", text: question };
    setMessages([...history, userMsg]);
    setInput("");
    setTyping(true);

    // A short pause feels more natural than an instant answer
    const [reply] = await Promise.all([
      getReply(question, history).catch((): BotReply => ({ text: "Sorry, something went wrong. Please try again." })),
      new Promise((r) => setTimeout(r, 450 + Math.random() * 400)),
    ]);

    const botMsg: ChatMessage = { id: newId(), role: "bot", ...reply };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTyping(false);
    setMessages((m) => [...m, botMsg]);
    if (!reduced) setStreaming({ id: botMsg.id, shown: 0 });
    busyRef.current = false;
  }, []);

  // Other buttons on the site can open the chat, optionally with a question
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const question = (e as CustomEvent<{ question?: string }>).detail?.question;
      if (question) void send(question);
    };
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, [send]);

  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  const close = () => {
    setOpen(false);
    launcherRef.current?.focus({ preventScroll: true });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const reset = () => {
    setMessages([greeting]);
    setStreaming(null);
  };

  const last = messages[messages.length - 1];
  const suggestions = !typing && !streaming && last?.role === "bot" ? (last.suggestions ?? []) : [];

  return (
    <>
      {/* Launcher */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`btn btn-primary fixed bottom-5 right-5 z-[60] !px-4 !py-3 shadow-glow transition-all duration-300 sm:!px-5 ${
          open ? "pointer-events-none translate-y-4 opacity-0" : ""
        }`}
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-white" />
        </span>
        <ChatIcon width={18} height={18} />
        <span className="hidden sm:inline">Ask my AI</span>
        <span className="sr-only sm:hidden">Ask my AI</span>
      </button>

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Ask my AI: chat about Asadullah"
        aria-hidden={!open}
        inert={!open}
        onKeyDown={(e) => e.key === "Escape" && close()}
        className={`fixed inset-x-3 bottom-3 z-[60] flex h-[min(620px,calc(100svh-5.5rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-line-strong bg-bg/95 shadow-[0_30px_100px_-20px_rgb(47_123_255/0.55)] backdrop-blur-xl transition-all duration-300 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[400px] ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line bg-surface/80 px-4 py-3.5">
          <span className="relative grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent font-display text-sm font-bold text-white">
            AA
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-emerald-400" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-ink">Ask my AI</p>
            <p className="truncate text-xs text-muted">Answers about Asadullah · instant</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-full px-2.5 py-1.5 text-xs text-muted transition hover:bg-white/5 hover:text-ink"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={close}
            aria-label="Close chat"
            className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-white/5 hover:text-ink"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Messages (data-lenis-prevent lets the wheel scroll this list, not the page) */}
        <div
          ref={listRef}
          data-lenis-prevent
          role="log"
          aria-live="polite"
          className="scrollbar-thin flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5"
        >
          {messages.map((m) => {
            if (m.role === "user") {
              return (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-white">
                    {m.text}
                  </p>
                </div>
              );
            }
            const isStreaming = streaming?.id === m.id;
            const text = isStreaming ? m.text.slice(0, streaming.shown) : m.text;
            return (
              <div key={m.id} className="flex flex-col items-start gap-2">
                <p className="max-w-[92%] whitespace-pre-line rounded-2xl rounded-bl-md border border-line bg-surface-2/80 px-4 py-3 text-sm leading-relaxed text-ink">
                  {text}
                  {isStreaming && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-accent align-middle" />}
                </p>
                {!isStreaming && m.links && m.links.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {m.links.map((l) =>
                      l.href.startsWith("/") && !l.href.endsWith(".pdf") ? (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => window.innerWidth < 640 && close()}
                          className="chip !border-primary/40 !bg-primary/10 text-primary-soft transition hover:!border-accent hover:text-accent"
                        >
                          {l.label} →
                        </Link>
                      ) : (
                        <a
                          key={l.href}
                          href={l.href}
                          {...(l.href.endsWith(".pdf") ? { download: true } : {})}
                          {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
                          className="chip !border-primary/40 !bg-primary/10 text-primary-soft transition hover:!border-accent hover:text-accent"
                        >
                          {l.label} ↗
                        </a>
                      ),
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {typing && (
            <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-surface-2/80 px-4 py-3.5" aria-label="Typing">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-1.5 animate-bounce rounded-full bg-accent" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div data-lenis-prevent className="scrollbar-none flex gap-2 overflow-x-auto border-t border-line px-4 py-3">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void send(s)}
                className="chip shrink-0 whitespace-nowrap transition hover:border-accent hover:text-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-line bg-surface/60 p-3">
          <label htmlFor="chat-input" className="sr-only">
            Ask a question about Asadullah
          </label>
          <input
            ref={inputRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={MAX_LENGTH}
            autoComplete="off"
            placeholder="Ask about projects, skills, hiring…"
            className="min-w-0 flex-1 rounded-full border border-line bg-bg/70 px-4 py-2.5 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            aria-label="Send"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-white transition hover:bg-primary-soft disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
        <p className="bg-surface/60 pb-2 text-center text-[10px] text-faint">Answers come from this portfolio. Nothing you type leaves your browser.</p>
      </div>
    </>
  );
}
