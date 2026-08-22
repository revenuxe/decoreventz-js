"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Phone, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function CompleteProfileForm({
  redirectTo,
  initialName,
}: {
  redirectTo: string;
  initialName: string;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expired — please sign in again");

      const { error } = await supabase
        .from("profiles")
        .update({ full_name: name.trim(), phone: phone.trim() })
        .eq("id", user.id);
      if (error) throw error;

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-background to-muted/50 pb-16">
      <main className="mx-auto max-w-md px-5 pt-16">
        <h1 className="font-display text-4xl leading-tight">Just one more step</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your name and mobile number — we&apos;ll use these for pickup and delivery, and
          fill them in automatically next time.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary">
            <span className="text-muted-foreground">
              <User className="h-4 w-4" />
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary">
            <span className="text-muted-foreground">
              <Phone className="h-4 w-4" />
            </span>
            <input
              type="tel"
              required
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Mobile number"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || phone.length !== 10}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-4 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue
          </button>
        </form>
      </main>
    </div>
  );
}
