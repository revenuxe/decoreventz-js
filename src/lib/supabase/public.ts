import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Plain anon Supabase client — no cookies, so it's safe to call from inside
// `unstable_cache` (see src/data/index.ts). RLS still applies: only rows
// with `is_active = true` are readable via the anon key.
export function publicSupabaseClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
