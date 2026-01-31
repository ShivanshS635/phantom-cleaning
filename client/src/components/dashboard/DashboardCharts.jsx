// DashboardCharts.jsx
import { useState } from "react";
import { BarChart3, PieChart, TrendingUp, MapPin, Users } from "lucide-react";
import JobsStatusChart from "./charts/JobsStatusChart";
import RevenueChart from "./charts/RevenueChart";
import JobsByCityChart from "./charts/JobsByCityChart";
import CleanerLoadChart from "./charts/CleanerLoadChart";
import ExpenseBreakdownChart from "./charts/ExpenseBreakdownChart";
import ProfitTrendChart from "./charts/ProfitTrendChart";

const chartViews = [
  { id: "revenue", label: "Revenue", icon: TrendingUp },
  { id: "status", label: "Job Status", icon: PieChart },
  { id: "cities", label: "Cities", icon: MapPin },
  { id: "cleaners", label: "Cleaners", icon: Users },
  { id: "expenses", label: "Expenses", icon: BarChart3 },
  { id: "profit", label: "Profit", icon: TrendingUp }
];

export default function DashboardCharts({ jobs, employees, expenses }) {
  const [activeView, setActiveView] = useState("revenue");

  const renderChart = () => {
    switch (activeView) {
      case "revenue":
        return <RevenueChart jobs={jobs} />;
      case "status":
        return <JobsStatusChart jobs={jobs} />;
      case "cities":
        return <JobsByCityChart jobs={jobs} />;
      case "cleaners":
        return <CleanerLoadChart jobs={jobs} />;
      case "expenses":
        return <ExpenseBreakdownChart expenses={expenses} />;
      case "profit":
        return <ProfitTrendChart jobs={jobs} expenses={expenses} />;
      default:
        return <RevenueChart jobs={jobs} />;
    }
  };

  const getChartTitle = () => {
    const view = chartViews.find(v => v.id === activeView);
    return view ? view.label : "Revenue";
  };

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
      {/* Chart Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{getChartTitle()} Overview</h3>
            <p className="text-sm text-gray-600 mt-1">
              Visual representation of your business metrics
            </p>
          </div>
          
          {/* Chart View Toggle */}
          <div className="flex flex-wrap gap-2">
            {chartViews.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === view.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <view.icon size={16} />
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        <div className="h-[600px]">
          {renderChart()}
        </div>
      </div>

      {/* Chart Info */}
      <div className="border-t border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">Total Data Points</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{jobs.length}</p>
            <p className="text-gray-600">jobs analyzed</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">Time Period</p>
            <p className="text-lg font-bold text-gray-900 mt-1">Custom Range</p>
            <p className="text-gray-600">adjustable via filters</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">Last Updated</p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-gray-600">live data</p>
          </div>
        </div>
      </div>
    </div>
  );
}