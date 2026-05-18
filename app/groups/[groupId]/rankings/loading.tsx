export default function RankingsLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <div className="h-7 w-20 animate-pulse rounded bg-muted" />
        <div className="mt-1 h-4 w-56 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-8">
        {[1, 2].map(i => (
          <div key={i} className="rounded-lg border p-6">
            <div className="mb-4 h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
