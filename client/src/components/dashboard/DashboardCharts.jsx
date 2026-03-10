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
    <div className="card overflow-hidden">
      {/* Chart Header */}
      <div className="border-b border-surface-3 bg-surface-1 p-5 sm:p-6 shrink-0">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-ink-primary">{getChartTitle()} Overview</h3>
            <p className="text-sm font-medium text-ink-muted mt-1">
              Visual representation of your business metrics
            </p>
          </div>

          {/* Chart View Toggle */}
          <div className="flex flex-wrap gap-2">
            <div className="flex overflow-x-auto pb-2 xl:pb-0 hide-scrollbar w-full xl:w-auto gap-2">
              {chartViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`inline-flex items-center whitespace-nowrap gap-2 px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all shrink-0 ${activeView === view.id
                    ? "bg-ink-primary text-surface-0 shadow-md"
                    : "bg-surface-0 border border-surface-3 text-ink-secondary hover:bg-surface-2"
                    }`}
                >
                  <view.icon size={14} />
                  {view.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-4 sm:p-6 bg-surface-0 border-b border-surface-3">
        <div className="h-[400px] sm:h-[500px] lg:h-[600px] min-h-[400px]">
          {renderChart()}
        </div>
      </div>

      {/* Chart Info */}
      <div className="border-t border-surface-3 bg-surface-1 p-5 sm:p-6 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-4 bg-surface-0 border border-surface-3 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest">Total Data Points</p>
            <p className="text-2xl font-bold text-ink-primary mt-1.5">{jobs.length}</p>
            <p className="text-[10px] font-bold text-ink-muted mt-1 uppercase tracking-widest">jobs analyzed</p>
          </div>
          <div className="text-center p-4 bg-surface-0 border border-surface-3 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest">Time Period</p>
            <p className="text-lg font-bold text-ink-primary mt-1.5">Custom Range</p>
            <p className="text-[10px] font-bold text-ink-muted mt-1 uppercase tracking-widest">adjustable via filters</p>
          </div>
          <div className="text-center p-4 bg-surface-0 border border-surface-3 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest">Last Updated</p>
            <p className="text-lg font-bold text-ink-primary mt-1.5">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-[10px] font-bold text-brand-600 mt-1 uppercase tracking-widest animate-pulse">live data</p>
          </div>
        </div>
      </div>
    </div>
  );
}