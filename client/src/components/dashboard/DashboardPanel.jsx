import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardCharts from "./DashboardCharts";
import DashboardFilters from "./DashboardFilters";
import ExpensesPanel from "./ExpensesPanel";

export default function DashboardPanel({ onLock }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs");
      setJobs(res.data.data || []);
    } catch {
      alert("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (!job.date) return false;
    const d = new Date(job.date);
    if (fromDate && d < new Date(fromDate)) return false;
    if (toDate && d > new Date(toDate)) return false;
    return true;
  });
  const stats = {
    totalJobs: filteredJobs.length,
    completedJobs: filteredJobs.filter(j => j.status === "Completed").length,
    todayJobs: filteredJobs.filter(
      j => j.date === new Date().toISOString().split("T")[0]
    ).length,
    totalRevenue:
      filteredJobs
        .filter(j => j.status === "Completed")
        .reduce((sum, j) => sum + Number(j.price || 0), 0) -
      totalExpenses,
    activeCleaners: new Set(
      filteredJobs.filter(j => j.assignedEmployee).map(j => j.assignedEmployee._id)
    ).size
  };
  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      {/* TOP BAR */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          📊 Admin Dashboard
        </h1>

        <button
          onClick={onLock}
          className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded-lg shadow"
        >
          🔒 Lock
        </button>
      </div>

      {/* FILTERS */}
      <DashboardFilters
        from={fromDate}
        to={toDate}
        setFrom={setFromDate}
        setTo={setToDate}
      />

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Total Jobs" value={stats.totalJobs} color="blue" icon="🧹" />
        <StatCard title="Completed" value={stats.completedJobs} color="green" icon="✅" />
        <StatCard title="Today Jobs" value={stats.todayJobs} color="yellow" icon="📅" />
        <StatCard title="Revenue" value={`$${stats.totalRevenue}`} color="purple" icon="💰" />
        <StatCard title="Cleaners" value={stats.activeCleaners} color="pink" icon="👷" />
      </div>

      <ExpensesPanel onChange={setExpenses} />

      {/* CHARTS */}
      <div className="bg-white rounded-xl shadow p-4">
        <DashboardCharts jobs={filteredJobs} />
      </div>
    </div>
  );
}

/* ===== STAT CARD ===== */

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    purple: "bg-purple-50 text-purple-700",
    pink: "bg-pink-50 text-pink-700"
  };

  return (
    <div
      className={`p-4 rounded-xl shadow-sm hover:shadow-md transition transform hover:-translate-y-1 ${colors[color]}`}
    >
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">{title}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
