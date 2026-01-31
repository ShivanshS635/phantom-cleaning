import { useState } from "react";
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Legend,
  ComposedChart
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3 } from "lucide-react";

export default function ProfitTrendChart({ jobs, expenses }) {
  const [view, setView] = useState("profit"); // "profit" | "revenue" | "expenses"

  // Calculate daily data
  const dailyData = {};
  
  jobs.forEach(job => {
    if (job.status === "Completed" && job.date) {
      if (!dailyData[job.date]) {
        dailyData[job.date] = { date: job.date, revenue: 0, expenses: 0 };
      }
      dailyData[job.date].revenue += job.price || 0;
    }
  });

  expenses.forEach(expense => {
    if (expense.date) {
      if (!dailyData[expense.date]) {
        dailyData[expense.date] = { date: expense.date, revenue: 0, expenses: 0 };
      }
      dailyData[expense.date].expenses += expense.amount || 0;
    }
  });

  const data = Object.values(dailyData)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30) // Last 30 days
    .map(item => ({
      ...item,
      profit: item.revenue - item.expenses,
      profitMargin: item.revenue > 0 ? ((item.revenue - item.expenses) / item.revenue * 100).toFixed(1) : 0,
      date: new Date(item.date).toLocaleDateString('en-AU', { 
        day: 'numeric', 
        month: 'short' 
      })
    }));

  // Calculate summary stats
  const summary = {
    totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0),
    totalExpenses: data.reduce((sum, item) => sum + item.expenses, 0),
    totalProfit: data.reduce((sum, item) => sum + item.profit, 0),
    avgProfitMargin: data.length > 0 
      ? (data.reduce((sum, item) => sum + parseFloat(item.profitMargin), 0) / data.length).toFixed(1)
      : 0
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}:</span>
              </div>
              <span className="font-medium text-gray-900">
                ${Number(entry.value).toLocaleString()}
              </span>
            </div>
          ))}
          {payload.find(p => p.name === "Profit") && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Profit Margin:</span>
                <span className={`font-medium ${
                  payload.find(p => p.name === "Profit").value > 0 
                    ? "text-green-600" 
                    : "text-red-600"
                }`}>
                  {payload.find(p => p.name === "Profit").payload.profitMargin}%
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // View 1: Simple Profit Line Chart (Easiest to understand)
  const renderProfitLineChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* Revenue bars (background) */}
        <Bar 
          dataKey="revenue" 
          fill="#dcfce7" 
          name="Revenue"
          barSize={20}
        />
        
        {/* Profit line (primary metric) */}
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#8b5cf6"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Profit"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  // View 2: Comparison Bar Chart
  const renderComparisonChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="revenue" 
          fill="#10b981" 
          name="Revenue"
          barSize={20}
        />
        <Bar 
          dataKey="expenses" 
          fill="#ef4444" 
          name="Expenses"
          barSize={20}
        />
        <Bar 
          dataKey="profit" 
          fill="#8b5cf6" 
          name="Profit"
          barSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  // View 3: Single Metric Focus
  const renderSingleMetricChart = () => {
    const metricKey = view;
    const metricConfig = {
      profit: { color: "#8b5cf6", name: "Profit" },
      revenue: { color: "#10b981", name: "Revenue" },
      expenses: { color: "#ef4444", name: "Expenses" }
    };

    const config = metricConfig[metricKey];

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`color${metricKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
          <Tooltip 
            formatter={(value) => [`$${Number(value).toLocaleString()}`, config.name]}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Area 
            type="monotone"
            dataKey={metricKey}
            stroke={config.color}
            strokeWidth={2}
            fill={`url(#color${metricKey})`}
            name={config.name}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chart Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Profit & Loss Trend</h3>
          <p className="text-sm text-gray-600">Daily revenue, expenses, and profit over time</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-2 mt-2 lg:mt-0">
          <button
            onClick={() => setView("profit")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              view === "profit" 
                ? "bg-purple-100 text-purple-700" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Profit Focus
          </button>
          <button
            onClick={() => setView("revenue")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              view === "revenue" 
                ? "bg-green-100 text-green-700" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Revenue Only
          </button>
          <button
            onClick={() => setView("expenses")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              view === "expenses" 
                ? "bg-red-100 text-red-700" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Expenses Only
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-700">Total Revenue</span>
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-900 mt-1">
            ${summary.totalRevenue.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-100 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-700">Total Expenses</span>
            <TrendingDown size={16} className="text-red-600" />
          </div>
          <p className="text-xl font-bold text-red-900 mt-1">
            ${summary.totalExpenses.toLocaleString()}
          </p>
        </div>
        
        <div className={`${
          summary.totalProfit >= 0 ? "bg-purple-50 border-purple-100" : "bg-red-50 border-red-100"
        } border rounded-lg p-3`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              summary.totalProfit >= 0 ? "text-purple-700" : "text-red-700"
            }`}>
              Net Profit
            </span>
            {summary.totalProfit >= 0 ? (
              <TrendingUp size={16} className="text-purple-600" />
            ) : (
              <TrendingDown size={16} className="text-red-600" />
            )}
          </div>
          <p className={`text-xl font-bold mt-1 ${
            summary.totalProfit >= 0 ? "text-purple-900" : "text-red-900"
          }`}>
            ${summary.totalProfit.toLocaleString()}
          </p>
          <p className={`text-xs mt-1 ${
            summary.totalProfit >= 0 ? "text-purple-600" : "text-red-600"
          }`}>
            {summary.avgProfitMargin}% avg margin
          </p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-[300px]">
        {view === "profit" ? renderProfitLineChart() : renderSingleMetricChart()}
      </div>

      {/* Legend & Explanation */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-gray-700">Profit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-gray-700">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-700">Expenses</span>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          <strong>How to read:</strong> Positive bars show revenue, line shows profit after expenses. 
          Green line = profit, red line = loss. Higher bars = more revenue. Line above 0 = profitable day.
        </p>
      </div>
    </div>
  );
}