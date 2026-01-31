// DashboardLoading.jsx
import { Loader2} from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-28 h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="w-64 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-28 h-10 bg-gray-200 rounded"></div>
              <div className="w-32 h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow border border-gray-200 p-5">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
                <div>
                  <div className="w-24 h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="w-32 h-7 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="w-32 h-5 bg-gray-200 rounded"></div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts skeleton */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="w-48 h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="w-64 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-20 h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="animate-pulse">
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl shadow border border-gray-200 p-4">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="w-24 h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="w-32 h-7 bg-gray-200 rounded mb-1"></div>
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}