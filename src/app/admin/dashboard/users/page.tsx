"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

async function fetchUsers(): Promise<ProfileRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw error;
  return data ?? [];
}

export default function UsersPage() {
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["admin", "users"], queryFn: fetchUsers });

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-2xl">Users</h2>
        <p className="text-sm text-muted-foreground">{rows.length} customer profiles</p>
      </div>
      {isLoading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No users yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Phone</th>
                <th className="px-3 py-2 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-3 py-2 font-semibold">{r.full_name ?? "—"}</td>
                  <td className="px-3 py-2">{r.phone ?? "—"}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
