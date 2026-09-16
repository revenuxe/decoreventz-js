import type { Metadata } from "next";
import Link from "next/link";
import { CatalogImage as Image } from "@/components/CatalogImage";
import { CalendarCheck, ChevronRight, LogIn, PartyPopper } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { createClient } from "@/lib/supabase/server";
import { STATUS_META } from "./status-meta";

// Signed-in, user-specific account page — no organic value.
export const metadata: Metadata = {
  title: "My Bookings",
  description: "Track your event decoration bookings.",
  robots: { index: false, follow: true },
};

export default async function BookingsPage() {
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
          <h1 className="mt-5 font-display text-3xl">
            Sign in to Decor Eventz
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to view and track your event decoration bookings.
          </p>
          <Link
            href="/auth?redirect=%2Fbookings"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-brand px-6 py-4 text-sm font-bold text-primary-foreground shadow-glow"
          >
            Sign in / Create account
          </Link>
          <div className="mt-3">
            <GoogleSignInButton
              redirectTo="/bookings"
              label="Continue with Google"
            />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "id, order_code, status, event_date, event_time, total, created_at, booking_items(service_name, image, quantity)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-dvh bg-background">
      <TopBar />
      <main className="mx-auto max-w-md px-5 pb-28 pt-6 md:max-w-3xl">
        <h1 className="font-display text-3xl leading-tight md:text-5xl">
          My Bookings
        </h1>

        {!bookings || bookings.length === 0 ? (
          <div className="mt-10 flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
              <PartyPopper className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              You haven&apos;t booked a decoration yet.
            </p>
            <Link
              href="/categories"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
            >
              Browse decorations
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {bookings.map((b) => {
              const status = STATUS_META[b.status];
              const firstItem = b.booking_items[0];
              const itemCount = b.booking_items.reduce(
                (n, it) => n + it.quantity,
                0,
              );
              return (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-card transition active:scale-[0.99]"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-muted">
                    {firstItem?.image ? (
                      <Image
                        src={firstItem.image}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center">
                        <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold">
                        #{b.order_code}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.badgeClass}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {firstItem?.service_name}
                      {itemCount > 1 && ` +${itemCount - 1} more`}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {new Date(b.event_date).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        · {b.event_time}
                      </p>
                      <p className="text-sm font-bold text-gradient-brand">
                        ₹{Number(b.total).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-active:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
