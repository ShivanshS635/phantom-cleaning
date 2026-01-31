// ExpenseFilters.jsx - Updated to call onDateRangeChange immediately
import { Filter, X } from "lucide-react";

export default function ExpenseFilters({ category, dateRange, onCategoryChange, onDateRangeChange }) {
  const categories = [
    "all", "Supplies", "Equipment", "Travel", "Marketing", 
    "Office", "Software", "Services", "Training", "Other"
  ];

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    onDateRangeChange({
      from: start.toISOString().split("T")[0],
      to: end.toISOString().split("T")[0]
    });
  };

  const resetFilters = () => {
    onCategoryChange("all");
    onDateRangeChange({ from: "", to: "" });
  };

  const hasFilters = category !== "all" || dateRange.from || dateRange.to;

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Expenses</h3>
        </div>
        
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X size={16} />
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category === cat
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Date Range
          </label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyPreset(7)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
              >
                Last 7 days
              </button>
              <button
                onClick={() => applyPreset(30)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
              >
                Last 30 days
              </button>
              <button
                onClick={() => applyPreset(90)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
              >
                Last 3 months
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => {
                    onDateRangeChange({ ...dateRange, from: e.target.value });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => {
                    onDateRangeChange({ ...dateRange, to: e.target.value });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}