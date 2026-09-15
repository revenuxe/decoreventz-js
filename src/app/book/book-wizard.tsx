"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { CONTACT } from "@/lib/site";
import { useCart } from "@/lib/cart-store";
import { useDecorBookingDraft } from "@/lib/decor-booking-store";
import { createClient } from "@/lib/supabase/client";
import { StepEvent } from "./_components/step-event";
import { StepVenue } from "./_components/step-venue";
import { StepReview } from "./_components/step-review";
import { Success } from "./_components/success";

export function BookWizard() {
  const {
    draft,
    update,
    reset,
    ready: draftReady,
    step,
    setStep,
  } = useDecorBookingDraft();
  const { items, ready: cartReady, subtotal, clear } = useCart();
  const [done, setDone] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [redirectingToSignIn, setRedirectingToSignIn] = useState(false);
  const router = useRouter();
  const submissionLock = useRef(false);
  const checkoutRequest = useRef<{ fingerprint: string; id: string } | null>(null);

  const ready = draftReady && cartReady;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, done]);

  // This flow assumes a non-empty cart — items are chosen on category/service
  // detail pages, not inside the wizard itself (see ServiceDetailView).
  useEffect(() => {
    if (ready && !done && items.length === 0) router.replace("/categories");
  }, [ready, done, items.length, router]);

  if (!ready) return null;
  if (!done && items.length === 0) return null;

  function redirectToSignIn(nextStep: number) {
    // Persist the step for the return journey, then replace the protected
    // wizard UI immediately. This prevents Venue/Review flashing briefly
    // while Next finishes the client-side navigation to /auth.
    setStep(nextStep);
    setRedirectingToSignIn(true);
    router.push("/auth?redirect=%2Fbook");
  }

  const steps = ["Event", "Venue", "Review"] as const;
  const lastStep = steps.length - 1;
  const canContinue = () => {
    if (step === 0) return !!draft.eventDate && !!draft.eventTime;
    if (step === 1)
      return (
        !!draft.venue.line1 &&
        !!draft.venue.city &&
        !!draft.venue.pincode &&
        !!draft.venue.phone
      );
    return true;
  };

  async function submitBooking() {
    if (submissionLock.current) return;
    submissionLock.current = true;
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { redirectToSignIn(step); return; }
      const details = {
        event_date: draft.eventDate ?? "", event_time: draft.eventTime ?? "",
        venue_name: draft.venue.name || null, venue_line1: draft.venue.line1,
        venue_line2: draft.venue.line2 || null, venue_city: draft.venue.city,
        venue_pincode: draft.venue.pincode, venue_phone: draft.venue.phone,
        notes: draft.notes || null,
      };
      const lines = items.map((it) => ({
        product_id: it.productId, quantity: it.quantity,
        addon_ids: it.addOns.map((addon) => addon.id),
        customizations: it.balloonSelection
          ? { version: 1, balloon: it.balloonSelection, balloon_choice: it.balloonSelection.label }
          : it.balloonChoice ? { version: 1, balloon_choice: it.balloonChoice } : {},
      }));
      const fingerprint = JSON.stringify([user.id, details, lines, subtotal]);
      if (checkoutRequest.current?.fingerprint !== fingerprint) {
        // Persist the retry key so a lost response followed by a reload cannot duplicate an order.
        let saved: { fingerprint?: string; id?: string } | null = null;
        try { saved = JSON.parse(sessionStorage.getItem("decor_checkout_request") ?? "null"); } catch {}
        checkoutRequest.current = {
          fingerprint,
          id: saved?.fingerprint === fingerprint && typeof saved.id === "string" ? saved.id : crypto.randomUUID(),
        };
        try { sessionStorage.setItem("decor_checkout_request", JSON.stringify(checkoutRequest.current)); } catch {}
      }
      const { data: booking, error } = await supabase.rpc("create_booking", {
        _request_id: checkoutRequest.current.id, _details: details,
        _items: lines, _expected_total: subtotal,
      }).single();
      if (error || !booking) {
        toast.error(error?.message ?? "Could not create your booking. Please try again.");
        return;
      }
      setOrderCode(booking.order_code);
      setBookingId(booking.id);
      setDone(true);
      clear();
      reset();
      checkoutRequest.current = null;
      try { sessionStorage.removeItem("decor_checkout_request"); } catch {}
    } catch {
      toast.error("Could not confirm your booking. Please retry; your cart has been saved.");
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  }

  async function saveVenueAddress() {
    if (draft.venue.addressId) return true;
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      redirectToSignIn(2);
      return false;
    }
    const { data: existing, error: lookupError } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", user.id)
      .eq("line1", draft.venue.line1)
      .eq("city", draft.venue.city)
      .eq("pincode", draft.venue.pincode)
      .eq("phone", draft.venue.phone)
      .limit(1)
      .maybeSingle();
    if (lookupError) {
      toast.error("Could not save your address. Please try again.");
      return false;
    }
    if (existing) {
      update({ venue: { ...draft.venue, addressId: existing.id } });
      return true;
    }
    const { count, error: countError } = await supabase
      .from("addresses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (countError) {
      toast.error("Could not save your address. Please try again.");
      return false;
    }
    const { data: address, error: saveError } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        label: draft.venue.label || "Home",
        line1: draft.venue.line1,
        line2: draft.venue.line2 || null,
        city: draft.venue.city,
        pincode: draft.venue.pincode,
        phone: draft.venue.phone,
        is_default: (count ?? 0) === 0,
      })
      .select("id")
      .single();
    if (saveError || !address) {
      toast.error(
        saveError?.message ?? "Could not save your address. Please try again.",
      );
      return false;
    }
    update({ venue: { ...draft.venue, addressId: address.id } });
    return true;
  }

  async function next() {
    if (checkingAccount || submitting) return;
    setCheckingAccount(true);
    try {
      if (step === 0) {
        const { data: { user } } = await createClient().auth.getUser();
        if (!user) { redirectToSignIn(1); return; }
        setStep(1);
      } else if (step === 1) {
        if (await saveVenueAddress()) setStep(2);
      } else {
        await submitBooking();
      }
    } catch {
      toast.error("Could not continue. Check your connection and try again.");
    } finally {
      setCheckingAccount(false);
    }
  }
  const back = () => {
    if (step > 0) setStep(step - 1);
    else router.push("/cart");
  };

  if (done) return <Success orderId={orderCode} bookingId={bookingId} />;
  if (redirectingToSignIn) return <div className="grid min-h-dvh place-items-center bg-background p-6 text-center text-sm font-semibold text-muted-foreground">Taking you to sign in…</div>;

  return (
    <div className="min-h-dvh bg-background pb-32">
      <TopBar />

      {/* Progress */}
      <div className="sticky top-[57px] z-30 border-b border-border/60 bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-md items-center gap-3 px-5 py-3 md:max-w-3xl">
          <button
            onClick={back}
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
              <span>
                Step {step + 1} of {steps.length}
              </span>
              <span className="text-foreground">{steps[step]}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-brand transition-all duration-500"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-md px-5 pt-6 md:max-w-3xl">
        {step === 0 && <StepEvent draft={draft} update={update} />}
        {step === 1 && <StepVenue draft={draft} update={update} />}
        {step === 2 && (
          <StepReview draft={draft} items={items} subtotal={subtotal} />
        )}

        <a
          href={CONTACT.whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-3 text-xs font-semibold text-muted-foreground"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Not sure? Chat with a Decor Eventz decorator
        </a>
      </main>

      {/* Sticky footer */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg">
        <div className="mx-auto max-w-md px-5 md:max-w-3xl">
          <div className="flex items-center gap-3">
            <button
              onClick={back}
              disabled={submitting}
              className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={next}
              disabled={!canContinue() || submitting || checkingAccount}
              className="flex-1 rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
            >
              {submitting
                ? "Booking…"
                : checkingAccount
                  ? "Checking account…"
                  : step === lastStep
                    ? "Confirm Booking"
                    : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
