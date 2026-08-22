import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VendorAuthForm } from "./vendor-auth-form";

export const metadata: Metadata = {
  title: "Vendor sign-in | Decor Eventz",
  description: "Sign in or apply as a Decor Eventz vendor.",
  robots: { index: false, follow: false },
};

export default async function VendorLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: isVendor } = await supabase.rpc("has_role", { _user_id: user.id, _role: "vendor" });
    if (isVendor) {
      const { data: vendor } = await supabase
        .from("vendors")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (vendor?.status === "approved") redirect("/vendor/dashboard");
      if (vendor) redirect("/vendor/status");
    }
  }

  return <VendorAuthForm />;
}
