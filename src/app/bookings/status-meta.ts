import { CalendarCheck, CheckCircle2, Clock, PartyPopper, XCircle } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

export type BookingStatus = Database["public"]["Enums"]["booking_status"];

export const STATUS_META: Record<
  BookingStatus,
  { label: string; description: string; icon: typeof Clock; badgeClass: string }
> = {
  pending: {
    label: "Pending",
    description: "We've received your booking and are reviewing the details.",
    icon: Clock,
    badgeClass: "bg-amber-500/15 text-amber-600",
  },
  confirmed: {
    label: "Confirmed",
    description: "Your booking is confirmed — a decorator will be assigned soon.",
    icon: CheckCircle2,
    badgeClass: "bg-primary/15 text-primary",
  },
  preparing: {
    label: "Preparing",
    description: "Your decorations are being prepared for setup.",
    icon: CalendarCheck,
    badgeClass: "bg-accent/15 text-accent",
  },
  completed: {
    label: "Completed",
    description: "Setup complete — hope your event was amazing!",
    icon: PartyPopper,
    badgeClass: "bg-emerald-500/15 text-emerald-600",
  },
  cancelled: {
    label: "Cancelled",
    description: "This booking was cancelled.",
    icon: XCircle,
    badgeClass: "bg-destructive/15 text-destructive",
  },
};

// The linear happy-path order used to render the timeline; "cancelled" is a
// terminal branch off "pending" so it's excluded here and handled specially.
export const STATUS_ORDER: BookingStatus[] = ["pending", "confirmed", "preparing", "completed"];
