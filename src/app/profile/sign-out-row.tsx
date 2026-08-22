"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutRow() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="flex w-full items-center gap-3 p-4 text-left active:bg-muted"
    >
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-muted">
        <LogOut className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">Sign out</p>
      </div>
    </button>
  );
}
