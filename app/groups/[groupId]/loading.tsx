export default function GroupDashboardLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 h-5 w-64 animate-pulse rounded bg-muted" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-lg border p-6">
            <div className="mb-2 h-3 w-16 animate-pulse rounded bg-muted" />
            <div className="h-7 w-12 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border p-6">
        <div className="mb-4 h-5 w-24 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}
