"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, User, Building2, Phone, MapPin, ArrowLeft, Store } from "lucide-react";

export function VendorAuthForm() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [mode, setMode] = useState<"signin" | "apply">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function signIn() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) throw error ?? new Error("Sign-in failed");
    const userId = data.session.user.id;

    const { data: isVendor } = await supabase.rpc("has_role", { _user_id: userId, _role: "vendor" });
    if (!isVendor) {
      await supabase.auth.signOut();
      throw new Error("This account isn't registered as a vendor.");
    }

    const { data: vendor } = await supabase
      .from("vendors")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();

    router.push(vendor?.status === "approved" ? "/vendor/dashboard" : "/vendor/status");
    router.refresh();
  }

  async function apply() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: contactName, phone } },
    });
    if (error) throw error;

    // Mirrors the customer sign-up form's pattern: if email confirmation is
    // required, there's no session yet to insert the vendor role/row under
    // (both are RLS-gated to auth.uid()) — the applicant has to confirm and
    // sign back in here to finish. When confirmation is off, this proceeds
    // immediately like the rest of the app already assumes it does.
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      setInfo("Check your inbox to confirm your email, then sign in here to finish applying.");
      return;
    }

    const userId = sess.session.user.id;
    const { error: roleError } = await supabase.from("user_roles").insert({ user_id: userId, role: "vendor" });
    if (roleError) throw roleError;

    const { error: vendorError } = await supabase.from("vendors").insert({
      user_id: userId,
      business_name: businessName,
      contact_name: contactName,
      phone,
      address_line1: line1,
      address_line2: line2 || null,
      city,
      pincode,
    });
    if (vendorError) throw vendorError;

    router.push("/vendor/status");
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signin") await signIn();
      else await apply();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-background to-muted/50 pb-16">
      <header className="mx-auto flex max-w-md items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          aria-label="Back to storefront"
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="flex items-center gap-1.5 text-sm font-bold">
          <Store className="h-4 w-4" /> Vendor Portal
        </span>
        <span className="w-10" />
      </header>

      <main className="mx-auto max-w-md px-5 pt-10">
        <h1 className="font-display text-4xl leading-tight">
          {mode === "signin" ? "Vendor sign-in" : "Apply as a vendor"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to manage the orders assigned to you."
            : "Tell us about your business — we'll review your application and get back to you."}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          {mode === "apply" && (
            <>
              <Field icon={<Building2 className="h-4 w-4" />}>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Business name"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </Field>
              <Field icon={<User className="h-4 w-4" />}>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Contact person's name"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </Field>
              <Field icon={<Phone className="h-4 w-4" />}>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </Field>
              <Field icon={<MapPin className="h-4 w-4" />}>
                <input
                  type="text"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="Address line 1"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </Field>
              <Field icon={<span className="w-4" />}>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="Address line 2 (optional)"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field icon={<span className="w-4" />}>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </Field>
                <Field icon={<span className="w-4" />}>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Pincode"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </Field>
              </div>
            </>
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
            <p className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">{info}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-4 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Submit application"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New vendor?" : "Already have a vendor account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "apply" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="font-bold text-primary underline-offset-2 hover:underline"
          >
            {mode === "signin" ? "Apply here" : "Sign in"}
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
