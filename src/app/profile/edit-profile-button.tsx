"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function EditProfileButton({
  fullName,
  phone,
}: {
  fullName: string;
  phone: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(fullName);
  const [phoneValue, setPhoneValue] = useState(phone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    // Re-sync in case the fields changed since this button last mounted
    // (e.g. after a previous save on this same page load).
    setName(fullName);
    setPhoneValue(phone);
    setError(null);
    setOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expired — please sign in again");

      const { error } = await supabase
        .from("profiles")
        .update({ full_name: name.trim() || null, phone: phoneValue.trim() || null })
        .eq("id", user.id);
      if (error) throw error;

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label="Edit profile"
        className="glass-dark grid h-9 w-9 shrink-0 place-items-center self-start rounded-full"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              This is what we&apos;ll use for pickup and delivery — it also fills in
              automatically next time you book.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">
                Full name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">
                Mobile number
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={phoneValue}
                onChange={(e) => setPhoneValue(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Mobile number"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            {error && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
