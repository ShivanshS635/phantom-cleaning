// DashboardStats.jsx
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Clock,
  AlertTriangle
} from "lucide-react";

export default function DashboardStats({ stats }) {
  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      change: stats.revenueChange,
      prefix: "$"
    },
    {
      title: "Total Profit",
      value: `$${stats.profit.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-green-500",
      change: stats.revenue > 0 ? ((stats.profit / stats.revenue) * 100).toFixed(1) : 0,
      suffix: "% margin"
    },
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      icon: Calendar,
      color: "bg-blue-500",
      subtitle: `${stats.completedJobs} completed`
    },
    {
      title: "Today's Jobs",
      value: stats.todayJobs,
      icon: Clock,
      color: "bg-yellow-500"
    },
    {
      title: "Active Cleaners",
      value: `${stats.activeCleaners}/${stats.totalCleaners}`,
      icon: Users,
      color: "bg-purple-500",
      subtitle: `${stats.totalCleaners} total`
    },
    {
      title: "Pending Jobs",
      value: stats.pendingJobs,
      icon: AlertTriangle,
      color: "bg-orange-500",
      trend: stats.pendingJobs > 5 ? "high" : "low"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {statCards.map((stat) => (
        <div key={stat.title} className="bg-white rounded-xl shadow border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={`${stat.color} p-2 rounded-lg`}>
              <stat.icon size={20} className="text-white" />
            </div>
            {stat.change !== undefined && (
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stat.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{Math.abs(stat.change)}%</span>
              </div>
            )}
            {stat.trend && (
              <div className={`text-xs px-2 py-1 rounded-full ${stat.trend === "high" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {stat.trend === "high" ? "High" : "Low"}
              </div>
            )}
          </div>
          
          <div>
            <p className="text-sm text-gray-600">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
            )}
            {stat.suffix && (
              <p className="text-sm text-gray-500 mt-1">{stat.suffix}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}