import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MapPin, Bell, HelpCircle, Gift, LogIn, CalendarCheck } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";
import { SignOutRow } from "./sign-out-row";
import { EditProfileButton } from "./edit-profile-button";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your addresses and preferences.",
  robots: { index: false, follow: true },
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-dvh bg-background">
        <TopBar />
        <main className="mx-auto max-w-md px-5 pb-28 pt-6 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-brand text-primary-foreground shadow-glow">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="mt-5 font-display text-3xl">Sign in to Decor Eventz</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account or sign in to save addresses and book decorations faster.
          </p>
          <Link
            href="/auth?redirect=%2Fprofile"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-brand px-6 py-4 text-sm font-bold text-primary-foreground shadow-glow"
          >
            Sign in / Create account
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  const [{ data: profile }, { count: addresses }, { count: bookingsCount }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
    supabase.from("addresses").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const email = user.email ?? "";
  const initial = (profile?.full_name ?? email).trim().charAt(0).toUpperCase();

  const rows: { icon: React.ElementType; label: string; meta?: string; href?: string }[] = [
    {
      icon: CalendarCheck,
      label: "My Bookings",
      meta: bookingsCount ? `${bookingsCount} booking${bookingsCount === 1 ? "" : "s"}` : "No bookings yet",
      href: "/bookings",
    },
    {
      icon: MapPin,
      label: "Addresses",
      meta: addresses ? `${addresses} saved` : "Add a venue address",
      href: "/profile/addresses",
    },
    { icon: Bell, label: "Notifications", meta: "On" },
    { icon: Gift, label: "Refer & earn", meta: "₹100 credit" },
    { icon: HelpCircle, label: "Help & support" },
  ];

  return (
    <div className="min-h-dvh bg-background">
      <TopBar />
      <main className="mx-auto max-w-md px-5 pb-28 pt-2">
        <div className="rounded-[2rem] bg-gradient-brand p-6 text-primary-foreground shadow-elevated">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl glass-dark font-display text-3xl">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-2xl leading-tight">
                {profile?.full_name ?? "Decor Eventz member"}
              </p>
              <p className="truncate text-xs opacity-80">{email}</p>
            </div>
            <EditProfileButton fullName={profile?.full_name ?? ""} phone={profile?.phone ?? ""} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            {[
              [String(addresses ?? 0), "Addresses"],
              ["₹100", "Credits"],
            ].map(([v, l]) => (
              <div key={l} className="glass-dark rounded-2xl px-2 py-2">
                <p className="text-sm font-bold">{v}</p>
                <p className="text-[10px] opacity-80">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 divide-y divide-border overflow-hidden rounded-3xl bg-card shadow-card">
          {rows.map(({ icon: Icon, label, meta, href }) =>
            href ? (
              <Link
                key={label}
                href={href}
                className="flex w-full items-center gap-3 p-4 text-left active:bg-muted"
              >
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-muted">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{label}</p>
                  {meta && <p className="text-[11px] text-muted-foreground">{meta}</p>}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ) : (
              <div key={label} className="flex w-full items-center gap-3 p-4 text-left">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-muted">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{label}</p>
                  {meta && <p className="text-[11px] text-muted-foreground">{meta}</p>}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ),
          )}
          <SignOutRow />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
