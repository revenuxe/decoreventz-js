import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-3xl bg-gradient-brand shadow-glow" />
        <h1 className="font-display text-7xl text-foreground">404</h1>
        <h2 className="mt-3 text-lg font-semibold">This thread got lost.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for isn&apos;t here. Let&apos;s get you back to designing.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
        >
          Take me home
        </Link>
      </div>
    </div>
  );
}
