"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

const ADMIN_EMAIL = "admin@decoreventz.com";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      setErr(error?.message ?? "Sign-in failed");
      setBusy(false);
      return;
    }
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: data.session.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      await supabase.auth.signOut();
      setErr("This account is not authorized for the admin panel.");
      setBusy(false);
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-br from-background via-background to-muted p-5">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground"
        >
          ← Back to storefront
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-elevated">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-3xl leading-tight">Admin sign-in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Restricted access. Sign in with your Decor Eventz admin account.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <label className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ADMIN_EMAIL}
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </label>

            {err && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Sign in
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Decor Eventz · Admin Console
        </p>
      </div>
    </div>
  );
}
