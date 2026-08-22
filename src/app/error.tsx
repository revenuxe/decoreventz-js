"use client";

import { useEffect } from "react";

// TODO(migration): wire this into a real error-tracking service (Sentry,
// etc.) — the old app reported to Lovable's error collector, which we're
// dropping as part of the clean break. See docs/nextjs-migration-plan.md.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn&apos;t load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something snagged on our end. Try again in a moment.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={reset}
            className="rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
