import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "./auth-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in or create your Decor Eventz account to book decorations and track your bookings.",
  robots: { index: false, follow: true },
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  // Only ever redirect to a local path — the raw search param is
  // attacker-controlled (e.g. a crafted /auth?redirect= link), so an
  // absolute URL here would be an open-redirect vector.
  const redirectTo = params.redirect?.startsWith("/") ? params.redirect : "/";

  // Real SSR win over the old app: already-signed-in visitors are
  // redirected here, before any sign-in form HTML ships, instead of the
  // old client-only getSession() check that could flash the form first.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(redirectTo);

  return <AuthForm redirectTo={redirectTo} />;
}
