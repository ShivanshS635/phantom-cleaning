// DashboardLoading.jsx — Premium skeleton screen
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-surface-1 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-7 w-48" />
            <div className="skeleton h-4 w-64" />
          </div>
          <div className="flex gap-3">
            <div className="skeleton h-10 w-28 rounded-xl" />
            <div className="skeleton h-10 w-32 rounded-xl" />
          </div>
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="skeleton w-10 h-10 rounded-xl" />
              </div>
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-7 w-32 rounded" />
              <div className="skeleton h-0.5 w-full rounded-full" />
            </div>
          ))}
        </div>

        {/* Filter bar skeleton */}
        <div className="card p-4">
          <div className="flex gap-4">
            <div className="skeleton h-10 w-48 rounded-xl" />
            <div className="skeleton h-10 w-40 rounded-xl" />
            <div className="skeleton h-10 w-36 rounded-xl" />
          </div>
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="card p-5 space-y-4">
              <div className="skeleton h-5 w-36 rounded" />
              <div className="skeleton h-48 w-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* Quick stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="skeleton h-4 w-28 rounded" />
              <div className="skeleton h-6 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}