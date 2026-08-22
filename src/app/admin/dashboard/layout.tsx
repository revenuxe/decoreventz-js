import type { Metadata } from "next";
import { headers } from "next/headers";
import { AdminShell } from "./admin-shell";

export const metadata: Metadata = {
  title: "Admin dashboard | Decor Eventz",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // proxy.ts (middleware) already enforces signed-in + has_role("admin")
  // for every /admin/** route except /admin/login before this ever runs,
  // and forwards the validated user's email via a request header — no
  // second getUser() round trip needed here just to display it.
  const email = (await headers()).get("x-admin-email") ?? "";

  return <AdminShell email={email}>{children}</AdminShell>;
}
