"use client";

import { useRef, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";

export function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const submission = useRef<{ id: string; content: string } | null>(null);
  const inFlight = useRef(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    const content = JSON.stringify(fields);
    if (!submission.current || submission.current.content !== content) submission.current = { id: crypto.randomUUID(), content };
    inFlight.current = true;
    setBusy(true);
    setError("");
    setSuccess(false);
    try {
      const response = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, id: submission.current.id }),
        signal: AbortSignal.timeout(20_000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit your message. Please try again.");
      form.reset();
      submission.current = null;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error && err.name !== "TimeoutError" ? err.message : "The request timed out. Please try again; your message will not be submitted twice.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const inputClass = "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20";
  return <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8" aria-busy={busy}>
    <div className="flex gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/10 text-accent"><MessageCircle className="h-5 w-5" /></span><div><h2 className="text-xl font-bold text-primary">Send us a message</h2><p className="text-sm text-muted-foreground">We&apos;ll reply as soon as possible.</p></div></div>
    <fieldset disabled={busy} className="mt-6 space-y-3 disabled:opacity-70">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-semibold">Your name<input required minLength={2} maxLength={100} name="name" autoComplete="name" className={inputClass} /></label>
        <label className="space-y-1 text-sm font-semibold">Phone (optional)<input maxLength={30} name="phone" type="tel" autoComplete="tel" pattern="[+0-9\s().\-]*" className={inputClass} /></label>
      </div>
      <label className="block space-y-1 text-sm font-semibold">Email address<input required maxLength={254} name="email" type="email" autoComplete="email" className={inputClass} /></label>
      <label className="block space-y-1 text-sm font-semibold">Subject (optional)<input maxLength={150} name="subject" className={inputClass} /></label>
      <label className="block space-y-1 text-sm font-semibold">Your message<textarea required minLength={10} maxLength={5000} name="message" rows={5} placeholder="How can we help?" className={`${inputClass} resize-y`} /></label>
      <div aria-hidden="true" className="hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <button disabled={busy} type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand py-3.5 text-sm font-bold text-primary-foreground shadow-glow disabled:cursor-wait">{busy ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Send aria-hidden="true" className="h-4 w-4" />}{busy ? "Sending…" : "Send message"}</button>
    </fieldset>
    {success && <p role="status" className="mt-4 text-sm font-semibold text-green-700">Thanks! Your message has been received. Our team will get back to you soon.</p>}
    {error && <p role="alert" className="mt-4 text-sm font-semibold text-destructive">{error}</p>}
  </form>;
}
