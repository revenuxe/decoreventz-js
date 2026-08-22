import { TopBar } from "@/components/TopBar";

export default function BookLoading() {
  return (
    <div className="min-h-dvh animate-pulse bg-background pb-32">
      <TopBar />
      <div className="sticky top-[57px] z-30 border-b border-border/60 bg-background/85 px-5 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3 md:max-w-3xl">
          <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
          <div className="h-1.5 flex-1 rounded-full bg-muted" />
        </div>
      </div>
      <main className="mx-auto max-w-md px-5 pt-6 md:max-w-3xl">
        <div className="h-3 w-24 rounded-full bg-muted" />
        <div className="mt-2 h-7 w-56 rounded-lg bg-muted" />
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-3xl bg-muted" />
          ))}
        </div>
      </main>
    </div>
  );
}
