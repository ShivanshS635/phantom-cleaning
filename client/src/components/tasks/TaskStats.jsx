// TaskStats.jsx
import { 
  CheckCircle2, 
  PlayCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  CalendarDays
} from "lucide-react";

export default function TaskStats({ tasks }) {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "Completed").length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    pending: tasks.filter(t => t.status === "Pending").length,
    highPriority: tasks.filter(t => t.priority === "High").length,
    assigned: tasks.filter(t => t.assignedTo).length
  };

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: CalendarDays,
      color: "bg-blue-500",
      trend: "+12%"
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "bg-green-500",
      percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: PlayCircle,
      color: "bg-yellow-500"
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "bg-orange-500"
    },
    {
      label: "High Priority",
      value: stats.highPriority,
      icon: AlertCircle,
      color: "bg-red-500"
    },
    {
      label: "Assigned",
      value: `${stats.assigned}/${stats.total}`,
      icon: TrendingUp,
      color: "bg-purple-500",
      percentage: stats.total > 0 ? Math.round((stats.assigned / stats.total) * 100) : 0
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              {stat.percentage !== undefined && (
                <p className="text-xs text-gray-500 mt-1">{stat.percentage}%</p>
              )}
              {stat.trend && (
                <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
              )}
            </div>
            <div className={`${stat.color} p-2 rounded-lg`}>
              <stat.icon size={20} className="text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}