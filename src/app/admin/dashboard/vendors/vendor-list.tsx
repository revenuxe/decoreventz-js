"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin, Phone, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { VENDOR_STATUS_META, type VendorStatus } from "@/lib/vendor-status-meta";
import type { Database } from "@/lib/supabase/types";

type VendorRow = Database["public"]["Tables"]["vendors"]["Row"];

const FILTERS: { key: "all" | VendorStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const VENDORS_QUERY_KEY = ["admin", "vendors"];

async function fetchVendors(): Promise<VendorRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return data ?? [];
}

export function VendorList({ defaultFilter }: { defaultFilter: "all" | VendorStatus }) {
  const queryClient = useQueryClient();
  const { data: vendors = [], isLoading } = useQuery({ queryKey: VENDORS_QUERY_KEY, queryFn: fetchVendors });
  const [filter, setFilter] = useState<"all" | VendorStatus>(defaultFilter);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // reviewed_by fills in via the vendors.reviewed_by column default
  // (auth.uid()) — no need for a client-side getUser() round trip just to
  // stamp who acted.
  async function review(vendor: VendorRow, status: "approved" | "rejected", reason?: string) {
    setBusyId(vendor.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("vendors")
      .update({
        status,
        rejection_reason: status === "rejected" ? (reason ?? null) : null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", vendor.id);
    setBusyId(null);
    if (error) return alert(error.message);
    queryClient.invalidateQueries({ queryKey: VENDORS_QUERY_KEY });
    setRejecting(false);
    setRejectReason("");
  }

  // Removes the vendor profile only — their auth account and any orders
  // that were already assigned to them stay put (bookings.assigned_vendor_id
  // just falls back to null via its ON DELETE SET NULL), so this reads as
  // "revoke vendor access" rather than erasing their whole account/history.
  async function remove(vendor: VendorRow) {
    if (!confirm(`Delete "${vendor.business_name}"? This can't be undone.`)) return;
    setBusyId(vendor.id);
    const supabase = createClient();
    const { error } = await supabase.from("vendors").delete().eq("id", vendor.id);
    setBusyId(null);
    if (error) return alert(error.message);
    queryClient.invalidateQueries({ queryKey: VENDORS_QUERY_KEY });
    setSelectedId((id) => (id === vendor.id ? null : id));
  }

  const filtered = useMemo(
    () => (filter === "all" ? vendors : vendors.filter((v) => v.status === filter)),
    [vendors, filter],
  );
  const selected = selectedId ? (vendors.find((v) => v.id === selectedId) ?? null) : null;

  return (
    <section>
      <p className="mb-3 text-sm text-muted-foreground">
        {filtered.length} of {vendors.length} vendor{vendors.length === 1 ? "" : "s"}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === f.key ? "bg-gradient-brand text-primary-foreground shadow-glow" : "border border-border bg-card"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No vendors here yet.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((v) => {
            const meta = VENDOR_STATUS_META[v.status];
            return (
              <button
                key={v.id}
                onClick={() => setSelectedId(v.id)}
                className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left text-sm transition active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{v.business_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {v.contact_name} · {v.phone} · {v.city}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${meta.badgeClass}`}>
                  {meta.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4"
          onClick={() => {
            setSelectedId(null);
            setRejecting(false);
            setRejectReason("");
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] w-full max-w-sm overflow-y-auto rounded-t-3xl bg-card shadow-elevated md:max-h-[85vh] md:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 p-4 backdrop-blur-lg">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{selected.business_name}</p>
                <p className="truncate text-xs text-muted-foreground">{selected.contact_name}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => remove(selected)}
                  disabled={busyId === selected.id}
                  aria-label="Delete vendor"
                  title="Delete vendor"
                  className="grid h-8 w-8 place-items-center rounded-full border border-destructive/40 text-destructive disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setSelectedId(null)}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-full border border-border"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${VENDOR_STATUS_META[selected.status].badgeClass}`}
                >
                  {VENDOR_STATUS_META[selected.status].label}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p>{selected.phone}</p>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p>
                  {selected.address_line1}
                  {selected.address_line2 ? `, ${selected.address_line2}` : ""}, {selected.city} —{" "}
                  {selected.pincode}
                </p>
              </div>

              {selected.status === "rejected" && selected.rejection_reason && (
                <div className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
                  {selected.rejection_reason}
                </div>
              )}

              {selected.status === "pending" && (
                <div className="space-y-2 border-t border-border pt-4">
                  {rejecting ? (
                    <div className="space-y-2">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection (shown to the vendor)"
                        rows={3}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setRejecting(false)}
                          className="flex-1 rounded-full border border-border px-4 py-2 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => review(selected, "rejected", rejectReason)}
                          disabled={busyId === selected.id}
                          className="flex-1 rounded-full border border-destructive/40 px-4 py-2 text-xs font-semibold text-destructive disabled:opacity-60"
                        >
                          Confirm reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRejecting(true)}
                        disabled={busyId === selected.id}
                        className="flex-1 rounded-full border border-destructive/40 px-4 py-2 text-xs font-semibold text-destructive disabled:opacity-60"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => review(selected, "approved")}
                        disabled={busyId === selected.id}
                        className="flex-1 rounded-full bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-60"
                      >
                        {busyId === selected.id ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Approve"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
