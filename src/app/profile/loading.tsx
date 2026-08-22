import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export default function ProfileLoading() {
  return (
    <div className="min-h-dvh animate-pulse bg-background">
      <TopBar />
      <main className="mx-auto max-w-md px-5 pb-28 pt-2">
        <div className="h-[148px] rounded-[2rem] bg-muted" />
        <div className="mt-5 space-y-px overflow-hidden rounded-3xl bg-card shadow-card">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-2xl bg-muted" />
              <div className="h-4 flex-1 rounded bg-muted" />
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
