"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Mail, Lock, User, X } from "lucide-react";
import logo from "@/assets/decor-eventz-logo.webp";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

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

  function close() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  function afterSignedIn() {
    router.push(redirectTo);
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
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        afterSignedIn();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(mode === "signin" ? "signup" : "signin");
    setError(null);
    setInfo(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-primary/20 sm:items-center sm:justify-center sm:p-8">
      <div
        aria-hidden
        className="absolute inset-0 bg-primary/20 backdrop-blur-[4px]"
      />

      <section
        aria-labelledby="auth-title"
        className="relative z-10 mt-auto w-full max-w-md overflow-hidden rounded-t-[2rem] bg-card shadow-[0_28px_80px_rgba(53,6,67,.28)] sm:my-auto sm:rounded-[2rem]"
      >
        <div className="relative bg-gradient-brand px-6 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))] text-primary-foreground sm:px-7 sm:py-6">
          <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/10 blur-[1px]" />
          <div className="relative flex items-center justify-between gap-4">
            <Image
              src={logo}
              alt="Decor Eventz — Dream, Design, Deliver"
              width={175}
              height={48}
              className="h-11 w-[162px] rounded-lg bg-white px-2 object-contain object-left"
              priority
            />
            <button
              type="button"
              onClick={close}
              aria-label="Close sign in"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/15 transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-7 sm:px-8 sm:pb-8">
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border sm:hidden" />
          <h1
            id="auth-title"
            className="text-center font-display text-3xl leading-tight text-primary sm:text-4xl"
          >
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
            {mode === "signin"
              ? "Sign in to track orders, save measurements, and manage bookings."
              : "Join Decor Eventz to save your details and manage bookings."}
          </p>

          <GoogleSignInButton
            redirectTo={redirectTo}
            label={
              mode === "signin" ? "Sign in with Google" : "Sign up with Google"
            }
          />
          <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
            Or continue with email
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
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
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
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
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-4 text-sm font-bold text-primary-foreground shadow-glow transition hover:brightness-110 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="font-bold text-primary underline-offset-2 hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition focus-within:border-primary/45 focus-within:ring-2 focus-within:ring-primary/20">
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </label>
  );
}
