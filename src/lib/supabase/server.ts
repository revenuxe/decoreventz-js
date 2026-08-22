import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

// Import inside Server Components / Route Handlers / Server Actions:
//   import { createClient } from "@/lib/supabase/server";
//   const supabase = await createClient();
// A fresh client per request — Server Components can't share one across
// requests since it's bound to that request's cookies.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component (not a Route Handler/Server
            // Action) — cookies can't be set here. Harmless as long as
            // middleware.ts is also refreshing the session on every
            // request, which it is (see src/middleware.ts).
          }
        },
      },
    },
  );
}
