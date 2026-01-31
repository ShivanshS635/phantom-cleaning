// ExpenseSummary.jsx - Simplified or removed
// Since we now fetch stats in AdminExpenses, we can remove this component
// or keep it as a simple display component

// Or update to accept props:
export default function ExpenseSummary({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl shadow border border-gray-200 p-5">
            <div className="animate-pulse space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Use actual stats data if available
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Cards using actual stats data */}
    </div>
  );
}