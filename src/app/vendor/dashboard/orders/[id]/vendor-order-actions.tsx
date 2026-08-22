"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Check, CheckCircle2, Download, FileEdit, Loader2, Upload, Wallet, X, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadVendorOrderImage } from "@/lib/vendor-upload-client";
import type { Database } from "@/lib/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];
type PaymentStatus = Database["public"]["Enums"]["vendor_payment_status"];

const NEXT_STATUS_LABEL: Partial<Record<BookingStatus, string>> = {
  pending: "Confirm order",
  confirmed: "Start preparing",
};
const NEXT_STATUS: Partial<Record<BookingStatus, BookingStatus>> = {
  pending: "confirmed",
  confirmed: "preparing",
};

function money(n: number | null): string {
  return `Rs. ${Number(n ?? 0).toLocaleString("en-IN")}`;
}

export function VendorOrderActions({
  bookingId,
  status,
  acceptedAt,
  decorationImageUrl,
  teamImageUrl,
  quoteAmount,
  billAmount,
  paymentStatus,
  paidAmount,
}: {
  bookingId: string;
  status: BookingStatus;
  acceptedAt: string | null;
  decorationImageUrl: string | null;
  teamImageUrl: string | null;
  quoteAmount: number | null;
  billAmount: number | null;
  paymentStatus: PaymentStatus;
  paidAmount: number;
}) {
  const router = useRouter();
  const [quote, setQuote] = useState(quoteAmount ? String(quoteAmount) : "");
  const [savingQuote, setSavingQuote] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [responding, setResponding] = useState(false);
  const [decorationFile, setDecorationFile] = useState<File | null>(null);
  const [teamFile, setTeamFile] = useState<File | null>(null);
  const [completing, setCompleting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [showFinalizePopup, setShowFinalizePopup] = useState(false);
  const [finalAmount, setFinalAmount] = useState(billAmount ? String(billAmount) : quoteAmount ? String(quoteAmount) : "");
  const [finalizing, setFinalizing] = useState(false);

  async function respond(accept: boolean) {
    setResponding(true);
    const supabase = createClient();
    const { error } = await supabase.rpc(accept ? "vendor_accept_assignment" : "vendor_decline_assignment", {
      _booking_id: bookingId,
    });
    setResponding(false);
    if (error) return toast.error(error.message);
    toast.success(accept ? "Order accepted" : "Order declined");
    router.refresh();
    if (!accept) router.push("/vendor/dashboard/orders");
  }

  async function submitQuote() {
    const amount = Number(quote);
    if (!amount || amount <= 0) return toast.error("Enter a quote amount greater than 0");
    setSavingQuote(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("vendor_submit_quote", { _booking_id: bookingId, _amount: amount });
    setSavingQuote(false);
    if (error) return toast.error(error.message);
    toast.success("Quote submitted");
    router.refresh();
  }

  async function advance() {
    const next = NEXT_STATUS[status];
    if (!next) return;
    setAdvancing(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("vendor_update_booking_status", { _booking_id: bookingId, _new_status: next });
    setAdvancing(false);
    if (error) return toast.error(error.message);
    toast.success(`Order moved to ${next}`);
    router.refresh();
  }

  async function cancel() {
    setCancelling(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("vendor_update_booking_status", { _booking_id: bookingId, _new_status: "cancelled" });
    setCancelling(false);
    if (error) return toast.error(error.message);
    toast.success("Order cancelled");
    router.refresh();
  }

  async function complete() {
    if (!decorationFile || !teamFile) return toast.error("Both photos are required to mark this order completed");
    setCompleting(true);
    try {
      const [decorationUrl, teamUrl] = await Promise.all([
        uploadVendorOrderImage(decorationFile, bookingId, "decoration"),
        uploadVendorOrderImage(teamFile, bookingId, "team"),
      ]);
      const supabase = createClient();
      const { error } = await supabase.rpc("vendor_update_booking_status", {
        _booking_id: bookingId,
        _new_status: "completed",
        _decoration_image_url: decorationUrl,
        _team_image_url: teamUrl,
      });
      if (error) throw error;
      toast.success("Order marked as Completed");
      setShowFinalizePopup(true);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not complete this order");
    } finally {
      setCompleting(false);
    }
  }

  async function finalizePayment() {
    const amount = Number(finalAmount);
    if (!amount || amount <= 0) return toast.error("Enter a final price greater than 0");
    setFinalizing(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("vendor_finalize_payment", { _booking_id: bookingId, _final_amount: amount });
    setFinalizing(false);
    if (error) return toast.error(error.message);
    toast.success("Payment completed");
    setShowFinalizePopup(false);
    router.refresh();
  }

  async function recordPayment() {
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) return toast.error("Enter an amount greater than 0");
    setSavingPayment(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("vendor_payments")
      .insert({ booking_id: bookingId, amount, note: paymentNote.trim() || null, recorded_by: user?.id ?? null });
    setSavingPayment(false);
    if (error) return toast.error(error.message);
    toast.success("Payment recorded");
    setPaymentAmount("");
    setPaymentNote("");
    router.refresh();
  }

  if (!acceptedAt) {
    return (
      <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-card">
        <h2 className="mb-1 text-sm font-bold">Accept this order?</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Confirm you can take this job to unlock quoting, billing, and progress updates. Declining removes you
          from this order so admin can reassign it.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => respond(false)}
            disabled={responding}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-destructive/40 px-4 py-2.5 text-xs font-semibold text-destructive disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" /> Decline
          </button>
          <button
            onClick={() => respond(true)}
            disabled={responding}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {responding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Accept
          </button>
        </div>
      </section>
    );
  }

  const canCancel = status === "pending" || status === "confirmed" || status === "preparing";

  return (
    <>
      <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">Quote & billing</h2>
          <div className="flex items-center gap-1.5">
            {quoteAmount != null && (
              <a
                href={`/api/vendor/orders/${bookingId}/quote-pdf`}
                className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground"
                aria-label="Download quotation PDF"
                title="Download quotation PDF"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            )}
            {paymentStatus === "paid" && (
              <a
                href={`/api/vendor/orders/${bookingId}/invoice-pdf`}
                className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow"
                aria-label="Download invoice PDF"
                title="Download invoice PDF"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your quote (Rs.)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                disabled={paymentStatus === "paid"}
                placeholder="e.g. 3000"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
              <button
                onClick={submitQuote}
                disabled={savingQuote || paymentStatus === "paid"}
                className="shrink-0 rounded-xl bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-50"
              >
                {savingQuote ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
              </button>
            </div>
            <Link
              href={`/vendor/dashboard/orders/${bookingId}/quote`}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
            >
              <FileEdit className="h-3.5 w-3.5" />
              {paymentStatus === "paid" ? "View detailed quote" : quoteAmount != null ? "Edit detailed quote" : "Create a detailed quote"}
            </Link>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Billed amount</span>
            <span className="font-bold">{billAmount ? money(billAmount) : "Not set by admin yet"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                paymentStatus === "paid" ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"
              }`}
            >
              {paymentStatus === "paid" ? `Paid — ${money(paidAmount)}` : `${money(paidAmount)} paid so far`}
            </span>
          </div>

          {status === "completed" && paymentStatus !== "paid" && (
            <button
              onClick={() => setShowFinalizePopup(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-glow"
            >
              <Wallet className="h-3.5 w-3.5" /> Complete payment
            </button>
          )}

          {billAmount != null && paymentStatus !== "paid" && (
            <div className="space-y-2 border-t border-border/60 pt-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Record a payment you collected
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Amount"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Note (e.g. Advance, Final settlement)"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={recordPayment}
                disabled={savingPayment}
                className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-xs font-bold disabled:opacity-60"
              >
                {savingPayment ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Record payment"}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-card">
        <h2 className="mb-3 text-sm font-bold">Status</h2>

        {status === "completed" && (
          <div className="space-y-4">
            {decorationImageUrl && <PhotoPreview label="Decoration photo" url={decorationImageUrl} />}
            {teamImageUrl && <PhotoPreview label="Team photo" url={teamImageUrl} />}
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Order completed
            </p>
          </div>
        )}

        {status === "cancelled" && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
            <XCircle className="h-4 w-4" /> This order was cancelled.
          </p>
        )}

        {(status === "pending" || status === "confirmed") && (
          <div className="space-y-2">
            <button
              onClick={advance}
              disabled={advancing}
              className="w-full rounded-full bg-gradient-brand px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {advancing ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : NEXT_STATUS_LABEL[status]}
            </button>
          </div>
        )}

        {status === "preparing" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Upload a decoration photo and a photo with your team to mark this order completed.
            </p>
            <PhotoPicker label="Decoration photo" file={decorationFile} onChange={setDecorationFile} />
            <PhotoPicker label="Team photo" file={teamFile} onChange={setTeamFile} />
            <button
              onClick={complete}
              disabled={completing || !decorationFile || !teamFile}
              className="w-full rounded-full bg-gradient-brand px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {completing ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Mark as Completed"}
            </button>
          </div>
        )}

        {canCancel && (
          <div className="mt-3 border-t border-border/60 pt-3">
            {confirmingCancel ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-destructive">
                  Cancel this order? This can&apos;t be undone from here.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmingCancel(false)}
                    className="flex-1 rounded-full border border-border px-4 py-2 text-xs font-semibold"
                  >
                    Keep order
                  </button>
                  <button
                    onClick={cancel}
                    disabled={cancelling}
                    className="flex-1 rounded-full bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground disabled:opacity-60"
                  >
                    {cancelling ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Confirm cancel"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingCancel(true)}
                className="w-full rounded-full border border-destructive/40 px-4 py-2 text-xs font-semibold text-destructive"
              >
                Cancel order
              </button>
            )}
          </div>
        )}
      </section>

      {showFinalizePopup && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4"
          onClick={() => setShowFinalizePopup(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-t-3xl bg-card p-5 shadow-elevated md:rounded-3xl"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-brand text-primary-foreground">
                <Wallet className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-bold">Complete payment</h3>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Order completed — enter the final price and confirm payment to close it out.
            </p>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Final price (Rs.)
            </label>
            <input
              type="number"
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
              placeholder="e.g. 3600"
              className="mb-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowFinalizePopup(false)}
                className="flex-1 rounded-full border border-border px-4 py-2.5 text-xs font-semibold"
              >
                Later
              </button>
              <button
                onClick={finalizePayment}
                disabled={finalizing}
                className="flex-1 rounded-full bg-gradient-brand px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-60"
              >
                {finalizing ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Complete payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PhotoPicker({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-xs font-semibold text-muted-foreground">
      <Upload className="h-4 w-4 shrink-0" />
      <span className="truncate">{file ? file.name : label}</span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
        }}
      />
    </label>
  );
}

function PhotoPreview({ label, url }: { label: string; url: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
        <Image src={url} alt={label} fill sizes="480px" className="object-cover" />
      </div>
    </div>
  );
}
