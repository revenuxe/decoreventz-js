export default function AdminDashboardLoading() {
  return (
    <section aria-label="Loading dashboard" className="animate-pulse">
      <div className="mb-6 h-8 w-44 rounded-lg bg-muted" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-28 rounded-2xl border border-border bg-card" />
        ))}
      </div>
      <div className="mt-6 h-56 rounded-2xl border border-border bg-card" />
    </section>
  );
}
