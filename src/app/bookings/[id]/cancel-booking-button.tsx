"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function cancel() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("cancel_booking", { _booking_id: bookingId });
    setBusy(false);
    if (error) {
      toast.error("This booking can no longer be cancelled.");
      setConfirming(false);
      return;
    }
    toast.success("Booking cancelled");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={cancel}
          disabled={busy}
          className="flex-1 rounded-full bg-destructive px-5 py-3 text-sm font-bold text-destructive-foreground disabled:opacity-60"
        >
          {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Yes, cancel booking"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={busy}
          className="rounded-full border border-border px-5 py-3 text-sm font-semibold"
        >
          Keep it
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-destructive/40 px-5 py-3 text-sm font-bold text-destructive"
    >
      <XCircle className="h-4 w-4" /> Cancel booking
    </button>
  );
}
