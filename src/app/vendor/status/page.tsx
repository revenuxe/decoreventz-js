import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Clock, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = {
  title: "Application status | Decor Eventz Vendor Portal",
  robots: { index: false, follow: false },
};

export default async function VendorStatusPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("status, business_name, rejection_reason")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!vendor) redirect("/vendor/login");
  if (vendor.status === "approved") redirect("/vendor/dashboard");

  const rejected = vendor.status === "rejected";

  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-br from-background via-background to-muted p-5">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-elevated">
        <div
          className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${
            rejected ? "bg-destructive/10 text-destructive" : "bg-gradient-brand text-primary-foreground shadow-glow"
          }`}
        >
          {rejected ? <XCircle className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
        </div>
        <h1 className="mt-4 font-display text-2xl leading-tight">
          {rejected ? "Application not approved" : "Application under review"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {rejected
            ? vendor.rejection_reason || "Your vendor application wasn't approved this time."
            : `Thanks, ${vendor.business_name}. We're reviewing your application and will let you know once it's approved.`}
        </p>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
