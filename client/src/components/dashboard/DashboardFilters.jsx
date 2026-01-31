// DashboardFilters.jsx
import { Calendar, Filter, X } from "lucide-react";
import { useState } from "react";

export default function DashboardFilters({ from, to, setFrom, setTo }) {
  const [activePreset, setActivePreset] = useState("");

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    setFrom(start.toISOString().split("T")[0]);
    setTo(end.toISOString().split("T")[0]);
    setActivePreset(days.toString());
  };

  const resetFilters = () => {
    setFrom("");
    setTo("");
    setActivePreset("");
  };

  const presets = [
    { label: "Today", days: 0 },
    { label: "Yesterday", days: 1 },
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "This month", days: new Date().getDate() - 1 },
    { label: "Last month", days: 60 } // Approximation
  ];

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "Select date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Date Range Filters</h3>
        </div>
        
        {(from || to) && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X size={16} />
            Clear Filters
          </button>
        )}
      </div>

      {/* Quick Presets */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Quick Ranges</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset.days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activePreset === preset.days.toString()
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setActivePreset("");
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            {from && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {formatDateDisplay(from)}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setActivePreset("");
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            {to && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {formatDateDisplay(to)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error Validation */}
      {from && to && new Date(from) > new Date(to) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            From date cannot be after To date
          </p>
        </div>
      )}

      {/* Selected Range Display */}
      {(from || to) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Selected Range:</p>
          <p className="font-medium text-gray-900">
            {from ? formatDateDisplay(from) : "Any start"} → {to ? formatDateDisplay(to) : "Any end"}
          </p>
        </div>
      )}
    </div>
  );
}