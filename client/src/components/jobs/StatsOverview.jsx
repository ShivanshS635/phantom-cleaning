import { useMemo } from "react";
import { Users } from "lucide-react";

export default function StatsOverview({ jobs }) {
  const stats = useMemo(() => {
    const total = jobs.length;
    const upcoming = jobs.filter((j) => j.status === "Upcoming").length;
    const completed = jobs.filter((j) => j.status === "Completed").length;
    const redo = jobs.filter((j) => j.status === "Redo").length;
    const today = jobs.filter(
      (j) => j.date === new Date().toISOString().split("T")[0]
    ).length;

    const revenue = jobs
      .filter((j) => j.status === "Completed")
      .reduce((sum, job) => sum + (parseFloat(job.price) || 0), 0);

    return { total, upcoming, completed, redo, today, revenue };
  }, [jobs]);

  const statCards = [
    {
      label: "Total Jobs",
      value: stats.total,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Today",
      value: stats.today,
      icon: Users,
      color: "bg-green-500",
    },
    {
      label: "Upcoming",
      value: stats.upcoming,
      icon: Users,
      color: "bg-yellow-500",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: Users,
      color: "bg-emerald-500",
    },
    {
      label: "Redo",
      value: stats.redo,
      icon: Users,
      color: "bg-orange-500",
    },
    {
      label: "Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      icon: Users,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl shadow border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
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