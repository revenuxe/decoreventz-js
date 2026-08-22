"use client";

import { memo, useEffect, useState } from "react";
import { CalendarCheck, Flame, Layers, Loader2, Package, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Stats = {
  bookingCount: number;
  totalProducts: number;
  activeProducts: number;
  trendingCount: number;
  featuredCount: number;
  categoryCount: number;
};

export const OverviewPanel = memo(function OverviewPanel() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: products }, { count: categoryCount }, { count: bookingCount }] = await Promise.all([
        supabase.from("products").select("price,sale_price,is_active,is_trending,is_featured"),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
      ]);
      const rows = products ?? [];
      const activeProducts = rows.filter((p) => p.is_active).length;
      setStats({
        bookingCount: bookingCount ?? 0,
        totalProducts: rows.length,
        activeProducts,
        trendingCount: rows.filter((p) => p.is_trending).length,
        featuredCount: rows.filter((p) => p.is_featured).length,
        categoryCount: categoryCount ?? 0,
      });
    })();
  }, []);

  if (!stats) return <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />;

  const cards = [
    { label: "Bookings", value: stats.bookingCount, icon: CalendarCheck },
    { label: "Total products", value: stats.totalProducts, icon: Package },
    { label: "Active products", value: stats.activeProducts, icon: Sparkles },
    { label: "Trending", value: stats.trendingCount, icon: Flame },
    { label: "Featured", value: stats.featuredCount, icon: Sparkles },
    { label: "Categories", value: stats.categoryCount, icon: Layers },
  ];

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-2xl">Overview</h2>
        <p className="text-sm text-muted-foreground">Your catalog, at a glance.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card p-4 shadow-card"
          >
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
    </section>
  );
});
