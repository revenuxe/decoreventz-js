import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompleteProfileForm } from "./complete-profile-form";

export const metadata: Metadata = { title: "One more step", robots: { index: false, follow: true } };

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect?.startsWith("/") ? params.redirect : "/";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/auth?redirect=${encodeURIComponent(redirectTo)}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  // Already has both — nothing to collect (covers email/password
  // sign-ins, which set full_name at sign-up, and returning Google users).
  if (profile?.full_name && profile?.phone) {
    redirect(redirectTo);
  }

  return (
    <CompleteProfileForm redirectTo={redirectTo} initialName={profile?.full_name ?? ""} />
  );
}
