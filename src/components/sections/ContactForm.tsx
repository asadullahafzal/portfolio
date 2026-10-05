"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { LIMITS, validateContact, type ContactErrors, type ContactInput } from "@/lib/contact";
import { profile } from "@/data/profile";

type Status = "idle" | "sending" | "sent" | "error";

const ERROR_TEXT: Record<string, string> = {
  rate_limited: "You've sent a few messages already. Please try again in a few minutes, or email directly.",
  not_configured: "The form isn't connected yet. Please email directly for now.",
  delivery_failed: "Your message couldn't be delivered just now. Please try again, or email directly.",
};

const empty: ContactInput = { name: "", email: "", message: "" };

export default function ContactForm() {
  const [values, setValues] = useState<ContactInput>(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const [loadedAt] = useState(() => Date.now());
  const honeypot = useRef<HTMLInputElement>(null);
  // null = still checking; false = delivery not configured on the server yet
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => r.json())
      .then((d: { enabled?: boolean }) => setEnabled(Boolean(d.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  const update = (field: keyof ContactInput) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }

    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company: honeypot.current?.value ?? "", elapsedMs: Date.now() - loadedAt }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: ContactErrors };
      if (res.ok) {
        setStatus("sent");
        setValues(empty);
        return;
      }
      if (data.fields) setErrors(data.fields);
      setServerError(ERROR_TEXT[data.error ?? ""] ?? "Something went wrong. Please try again, or email directly.");
      setStatus("error");
    } catch {
      setServerError("You seem to be offline. Please check your connection, or email directly.");
      setStatus("error");
    }
  };

  if (enabled === false) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-surface/50 p-8 text-center">
        <p className="font-display text-xl font-semibold text-ink">The fastest way to reach me is email</p>
        <p className="max-w-sm text-sm text-muted">Tell me about your project, role or idea and I&apos;ll get back to you.</p>
        <a href={`mailto:${profile.email}`} className="btn btn-primary">
          Email {profile.email}
        </a>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div role="status" className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.06] p-8 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-emerald-400/15 text-2xl" aria-hidden>
          ✓
        </span>
        <p className="font-display text-xl font-semibold text-ink">Message sent!</p>
        <p className="max-w-sm text-sm text-muted">Thanks for reaching out. Asadullah will reply to your email soon.</p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-2 text-sm text-primary-soft transition hover:text-accent">
          Send another message
        </button>
      </div>
    );
  }

  const field = "w-full rounded-xl border bg-bg/70 px-4 py-3 text-sm text-ink placeholder:text-faint transition focus:border-accent focus:outline-none";
  const border = (f: keyof ContactInput) => (errors[f] ? "border-rose-400/70" : "border-line");

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 text-left">
      {/* Honeypot: hidden from people and assistive tech, tempting to bots */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company
          <input ref={honeypot} name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm text-muted">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            value={values.name}
            onChange={update("name")}
            maxLength={LIMITS.name.max}
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={`${field} ${border("name")}`}
            placeholder="Your name"
          />
          {errors.name && <p id="contact-name-error" className="mt-1.5 text-xs text-rose-300">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm text-muted">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={values.email}
            onChange={update("email")}
            maxLength={LIMITS.email.max}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={`${field} ${border("email")}`}
            placeholder="you@company.com"
          />
          {errors.email && <p id="contact-email-error" className="mt-1.5 text-xs text-rose-300">{errors.email}</p>}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor="contact-message" className="block text-sm text-muted">
            Message
          </label>
          <span className="font-mono text-[11px] text-faint">
            {values.message.length}/{LIMITS.message.max}
          </span>
        </div>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={values.message}
          onChange={update("message")}
          maxLength={LIMITS.message.max}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={`${field} ${border("message")} resize-y`}
          placeholder="Tell me about your project, role or idea…"
        />
        {errors.message && <p id="contact-message-error" className="mt-1.5 text-xs text-rose-300">{errors.message}</p>}
      </div>

      {status === "error" && (
        <p role="alert" className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {serverError}{" "}
          <a href={`mailto:${profile.email}`} className="underline underline-offset-2 hover:text-white">
            {profile.email}
          </a>
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full disabled:opacity-60 sm:w-auto">
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
