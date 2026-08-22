"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, Clock, Loader2, Wallet, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Stats = {
  total: number;
  awaitingSetup: number;
  inProgress: number;
  completed: number;
  unpaidTotal: number;
};

export default function VendorOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: vendor } = await supabase.from("vendors").select("id").eq("user_id", user.id).maybeSingle();
      if (!vendor) return;

      const { data: rows } = await supabase
        .from("bookings")
        .select("status, vendor_bill_amount, vendor_quote_amount, vendor_payment_status")
        .eq("assigned_vendor_id", vendor.id);

      const list = rows ?? [];
      const unpaidTotal = list
        .filter((b) => b.vendor_payment_status === "unpaid")
        .reduce((s, b) => s + Number(b.vendor_bill_amount ?? b.vendor_quote_amount ?? 0), 0);

      setStats({
        total: list.length,
        awaitingSetup: list.filter((b) => b.status === "confirmed").length,
        inProgress: list.filter((b) => b.status === "preparing").length,
        completed: list.filter((b) => b.status === "completed").length,
        unpaidTotal,
      });
    })();
  }, []);

  if (!stats) return <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />;

  const cards = [
    { label: "Assigned orders", value: stats.total, icon: CalendarCheck },
    { label: "Awaiting setup", value: stats.awaitingSetup, icon: Wrench },
    { label: "In progress", value: stats.inProgress, icon: Clock },
    { label: "Completed", value: stats.completed, icon: CheckCircle2 },
  ];

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-2xl">Overview</h2>
        <p className="text-sm text-muted-foreground">Your assigned orders, at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-xs font-semibold text-muted-foreground">{label}</p>
            </div>
            <p className="mt-3 font-display text-3xl">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
            <Wallet className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Outstanding (unpaid)</p>
            <p className="font-display text-2xl">Rs. {stats.unpaidTotal.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <Link
          href="/vendor/dashboard/orders"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow"
        >
          View assigned orders <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
