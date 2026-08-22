import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth (Google, etc.) lands here with a ?code= to exchange for a session.
// Always routes on to /auth/complete-profile next, which decides whether
// this user still needs to fill in name/mobile (new Google sign-ins won't
// have a phone number yet) before continuing to the original destination.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const cookieStore = await cookies();
  const rawRedirect = cookieStore.get("baraabar_oauth_redirect")?.value;
  cookieStore.delete("baraabar_oauth_redirect");
  // Only ever redirect to a local path — see the same guard in
  // src/app/auth/page.tsx for why.
  const redirectTo = rawRedirect?.startsWith("/") ? rawRedirect : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(
        `${origin}/auth/complete-profile?redirect=${encodeURIComponent(redirectTo)}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=oauth`);
}
