// DashboardPanel.jsx
import { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CheckCircle,
  RefreshCw,
  Lock,
  BarChart3,
  Loader2,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";
import api from "../../api/axios";
import { showError, showSuccess } from "../../utils/toast";
import DashboardCharts from "./DashboardCharts";
import DashboardFilters from "./DashboardFilters";
import MonthlyReportDownload from "./MonthlyReportDownload";
import DashboardStats from "./DashboardStats";

const STATES = ["Sydney", "Melbourne", "Brisbane", "Adelaide", "Perth"];

export default function DashboardPanel({ onLock }) {
  const [jobs, setJobs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [selectedState, setSelectedState] = useState("All");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const fetchAllData = async () => {
    setRefreshLoading(true);
    try {
      await Promise.all([fetchJobs(), fetchExpenses(), fetchEmployees()]);
      showSuccess("Dashboard refreshed");
    } catch {
      showError("Failed to refresh");
    } finally {
      setRefreshLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs");
      const d = res.data?.data || res.data || [];
      setJobs(Array.isArray(d) ? d : []);
    } catch { setJobs([]); }
  };

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      const d = res.data?.data || res.data || [];
      setExpenses(Array.isArray(d) ? d : []);
    } catch { setExpenses([]); }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      const d = res.data || [];
      setEmployees(Array.isArray(d) ? d : []);
    } catch { setEmployees([]); }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try { await Promise.all([fetchJobs(), fetchExpenses(), fetchEmployees()]); }
      catch { showError("Failed to load dashboard"); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filteredJobs = useMemo(() => {
    return (Array.isArray(jobs) ? jobs : []).filter((job) => {
      if (!job?.date) return false;
      try {
        const jobDate = new Date(job.date);
        if (dateRange.from && jobDate < new Date(dateRange.from)) return false;
        if (dateRange.to && jobDate > new Date(dateRange.to)) return false;
        if (selectedState !== "All" && job?.state !== selectedState) return false;
        return true;
      } catch { return false; }
    });
  }, [jobs, dateRange, selectedState]);

  const filteredExpenses = useMemo(() => {
    return (Array.isArray(expenses) ? expenses : []).filter((expense) => {
      if (!expense?.date) return false;
      try {
        const d = new Date(expense.date);
        if (dateRange.from && d < new Date(dateRange.from)) return false;
        if (dateRange.to && d > new Date(dateRange.to)) return false;
        if (selectedState !== "All" && expense?.state !== selectedState) return false;
        return true;
      } catch { return false; }
    });
  }, [expenses, dateRange, selectedState]);

  const stats = useMemo(() => {
    const completedJobs = filteredJobs.filter(j => j?.status === "Completed");
    const revenue = completedJobs.reduce((s, j) => s + (parseFloat(j?.price) || 0), 0);
    const totalExpenses = filteredExpenses.reduce((s, e) => s + (parseFloat(e?.amount) || 0), 0);
    const profit = revenue - totalExpenses;
    const today = new Date().toISOString().split("T")[0];
    const avgJobValue = completedJobs.length > 0 ? revenue / completedJobs.length : 0;
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100) : 0;

    return {
      totalJobs: filteredJobs.length,
      completedJobs: completedJobs.length,
      todayJobs: filteredJobs.filter(j => j?.date === today).length,
      pendingJobs: filteredJobs.filter(j => j?.status === "Pending").length,
      revenue,
      expenses: totalExpenses,
      profit,
      profitMargin,
      activeCleaners: new Set(filteredJobs.filter(j => j?.assignedEmployee?._id).map(j => j.assignedEmployee._id)).size,
      totalCleaners: employees.filter(e => e?.role === "Cleaner").length,
      avgJobValue,
    };
  }, [filteredJobs, filteredExpenses, employees]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/10 flex items-center justify-center mx-auto">
            <Loader2 className="animate-spin h-6 w-6 text-brand-600" />
          </div>
          <p className="text-sm font-medium text-ink-secondary">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-1 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600/10 flex items-center justify-center">
              <BarChart3 size={18} className="text-brand-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">
                {selectedState === "All" ? "All States" : selectedState}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchAllData}
              disabled={refreshLoading}
              className="btn-secondary gap-2 text-sm"
            >
              <RefreshCw size={15} className={refreshLoading ? "animate-spin" : ""} />
              {refreshLoading ? "Refreshing…" : "Refresh"}
            </button>
            <MonthlyReportDownload />
            <button
              onClick={onLock}
              className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              <Lock size={15} />
              Lock Dashboard
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <DashboardStats stats={stats} />

        {/* ── Filters ── */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2 text-ink-muted shrink-0">
              <SlidersHorizontal size={15} />
              <span className="text-xs font-medium">Filters</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <DashboardFilters
                from={dateRange.from}
                to={dateRange.to}
                setFrom={(v) => setDateRange(p => ({ ...p, from: v }))}
                setTo={(v) => setDateRange(p => ({ ...p, to: v }))}
              />
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="input-premium pl-8 pr-3 py-2 text-sm max-w-[140px] appearance-none"
                >
                  <option value="All">All States</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Charts ── */}
        <DashboardCharts
          jobs={filteredJobs}
          employees={employees}
          expenses={filteredExpenses}
        />

        {/* ── Quick Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStatCard
            title="Avg Job Value"
            value={`$${stats.avgJobValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            color="from-teal-500 to-cyan-500"
          />
          <QuickStatCard
            title="Profit Margin"
            value={`${stats.profitMargin.toFixed(1)}%`}
            icon={stats.profitMargin >= 0 ? TrendingUp : TrendingDown}
            color={stats.profitMargin >= 0 ? "from-emerald-500 to-green-500" : "from-rose-500 to-red-500"}
          />
          <QuickStatCard
            title="Cleaner Utilization"
            value={`${stats.totalCleaners > 0 ? Math.round((stats.activeCleaners / stats.totalCleaners) * 100) : 0}%`}
            icon={Users}
            color="from-purple-500 to-violet-500"
          />
          <QuickStatCard
            title="Completion Rate"
            value={`${stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0}%`}
            icon={CheckCircle}
            color="from-brand-500 to-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

function QuickStatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="stat-card flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm shrink-0`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">{title}</p>
        <p className="text-xl font-bold text-ink-primary mt-0.5">{value}</p>
      </div>
    </div>
  );
}