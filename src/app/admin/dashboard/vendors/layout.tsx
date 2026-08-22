"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/dashboard/vendors", label: "All Vendors", exact: true },
  { href: "/admin/dashboard/vendors/pending", label: "Pending Applications", exact: false },
  { href: "/admin/dashboard/vendors/orders", label: "Orders Assigned", exact: false },
  { href: "/admin/dashboard/vendors/billing", label: "Billing", exact: false },
];

export default function VendorsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-display text-2xl">Vendors</h2>
        <p className="text-sm text-muted-foreground">Manage decorator accounts and their assigned orders.</p>
      </div>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                active ? "bg-gradient-brand text-primary-foreground shadow-glow" : "border border-border bg-card"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
