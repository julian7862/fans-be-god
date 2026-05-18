export default function GroupsLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="h-10 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-lg border p-6">
            <div className="mb-2 h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
