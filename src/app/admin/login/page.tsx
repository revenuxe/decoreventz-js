import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLoginForm } from "./admin-login-form";

export const metadata: Metadata = {
  title: "Admin login | Decor Eventz",
  description: "Secure sign-in for Decor Eventz administrators.",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Real SSR win over the old app: an already-signed-in admin is bounced
  // to the dashboard before the sign-in form ever renders, via a
  // server-side has_role check — the old app did this client-side after
  // mount, which could flash the login form first.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (isAdmin) redirect("/admin/dashboard");
  }

  return <AdminLoginForm />;
}
