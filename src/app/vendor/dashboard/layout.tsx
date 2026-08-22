import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { VendorShell } from "./vendor-shell";

export const metadata: Metadata = {
  title: "Vendor dashboard | Decor Eventz",
  robots: { index: false, follow: false },
};

export default async function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
  // proxy.ts already enforces signed-in + has_role("vendor") + an approved
  // vendors row for every /vendor/dashboard/** route before this runs.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let businessName = "";
  if (user) {
    const { data: vendor } = await supabase
      .from("vendors")
      .select("business_name")
      .eq("user_id", user.id)
      .maybeSingle();
    businessName = vendor?.business_name ?? "";
  }

  return <VendorShell businessName={businessName}>{children}</VendorShell>;
}
