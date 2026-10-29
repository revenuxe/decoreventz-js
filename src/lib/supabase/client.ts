"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { getSupabaseConfig } from "./config";

// Import in Client Components like this:
//   import { createClient } from "@/lib/supabase/client";
//   const supabase = createClient();
export function createClient() {
  const { url, key } = getSupabaseConfig();
  return createBrowserClient<Database>(
    url,
    key,
  );
}
