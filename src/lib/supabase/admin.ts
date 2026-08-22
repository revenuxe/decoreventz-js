import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Service-role Supabase client — bypasses RLS entirely. `server-only` makes
// any accidental import from a "use client" module a BUILD ERROR, not just
// a lint warning (see docs/nextjs-migration-plan.md §7 risk register).
// Only use inside Server Actions / Route Handlers / Server Components for
// trusted, privileged operations. For normal user-scoped queries, use
// `@/lib/supabase/server` (RLS-enforced) instead.
function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL — admin client unavailable.",
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let _supabaseAdmin: ReturnType<typeof createSupabaseAdminClient> | undefined;

export function supabaseAdmin() {
  if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
  return _supabaseAdmin;
}
