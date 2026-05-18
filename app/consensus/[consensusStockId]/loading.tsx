export default function ConsensusDetailLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-lg border p-6">
                <div className="mb-2 h-3 w-16 animate-pulse rounded bg-muted" />
                <div className="h-7 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
          <div className="rounded-lg border p-6">
            <div className="mb-4 h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="rounded-lg border p-6">
              <div className="mb-3 h-5 w-20 animate-pulse rounded bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
