"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, User, ArrowLeft } from "lucide-react";
import logo from "@/assets/decor-eventz-logo.webp";

export function AuthForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function afterSignedIn() {
    router.push(redirectTo);
    // The server already rendered with the pre-sign-in session (or none).
    // Without this, Server Components on the destination route can serve
    // a stale, cached payload that doesn't reflect the new session yet.
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectTo}`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        setInfo(
          "Account created. If email confirmation is on, please confirm via your inbox — otherwise you're signed in.",
        );
        const { data: sess } = await supabase.auth.getSession();
        if (sess.session) afterSignedIn();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        afterSignedIn();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-background to-muted/50 pb-16">
      <header className="mx-auto flex max-w-md items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        {/* Goes back to wherever the user came from (e.g. the booking wizard,
            mid-flow) rather than forcing home. */}
        <button
          onClick={() => window.history.back()}
          aria-label="Back"
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Link href="/" className="flex items-center">
          <Image
            src={logo}
            alt="Decor Eventz — Dream, Design, Deliver"
            width={150}
            height={41}
            className="h-10 w-[150px] object-contain"
          />
        </Link>
        <span className="w-10" />
      </header>

      <main className="mx-auto max-w-md px-5 pt-10">
        <h1 className="font-display text-4xl leading-tight">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to track orders, save measurements, and manage bookings."
            : "Join Decor Eventz to save your details and manage bookings."}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          {mode === "signup" && (
            <Field icon={<User className="h-4 w-4" />}>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </Field>
          )}
          <Field icon={<Mail className="h-4 w-4" />}>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </Field>
          <Field icon={<Lock className="h-4 w-4" />}>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </Field>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-4 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="font-bold text-primary underline-offset-2 hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </main>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary">
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </label>
  );
}
