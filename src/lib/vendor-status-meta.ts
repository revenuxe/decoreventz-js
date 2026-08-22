import type { Database } from "@/lib/supabase/types";

export type VendorStatus = Database["public"]["Enums"]["vendor_status"];

export const VENDOR_STATUS_META: Record<VendorStatus, { label: string; badgeClass: string }> = {
  pending: { label: "Pending", badgeClass: "bg-amber-500/15 text-amber-600" },
  approved: { label: "Approved", badgeClass: "bg-emerald-500/15 text-emerald-600" },
  rejected: { label: "Rejected", badgeClass: "bg-destructive/15 text-destructive" },
};
