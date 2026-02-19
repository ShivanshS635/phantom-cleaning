// DashboardPanel.jsx - Fixed version
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
  MapPin
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
  const [dateRange, setDateRange] = useState({
    from: "",
    to: ""
  });


  const fetchAllData = async () => {
    setRefreshLoading(true);
    try {
      await Promise.all([
        fetchJobs(),
        fetchExpenses(),
        fetchEmployees()
      ]);
      showSuccess("Dashboard data refreshed");
    } catch (err) {
      showError("Failed to refresh data");
    } finally {
      setRefreshLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs");
      // Handle different response structures
      const jobsData = res.data?.data || res.data || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err) {
      showError("Failed to load jobs");
      setJobs([]);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      // Handle different response structures
      const expensesData = res.data?.data || res.data || [];
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
    } catch (err) {
      showError("Failed to load expenses");
      setExpenses([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      // Handle different response structures
      const employeesData = res.data || [];
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (err) {
      showError("Failed to load employees");
      setEmployees([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchJobs(),
          fetchExpenses(),
          fetchEmployees()
        ]);
      } catch (err) {
        showError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter jobs by date range and state
  const filteredJobs = useMemo(() => {
    const jobsArray = Array.isArray(jobs) ? jobs : [];
    return jobsArray.filter((job) => {
      if (!job?.date) return false;
      try {
        const jobDate = new Date(job.date);
        if (dateRange.from && jobDate < new Date(dateRange.from)) return false;
        if (dateRange.to && jobDate > new Date(dateRange.to)) return false;
        if (selectedState !== "All" && job?.state !== selectedState) return false;
        return true;
      } catch {
        return false;
      }
    });
  }, [jobs, dateRange, selectedState]);

  // Filter expenses by date range and state
  const filteredExpenses = useMemo(() => {
    const expensesArray = Array.isArray(expenses) ? expenses : [];
    return expensesArray.filter((expense) => {
      if (!expense?.date) return false;
      try {
        const expenseDate = new Date(expense.date);
        if (dateRange.from && expenseDate < new Date(dateRange.from)) return false;
        if (dateRange.to && expenseDate > new Date(dateRange.to)) return false;
        if (selectedState !== "All" && expense?.state !== selectedState) return false;
        return true;
      } catch {
        return false;
      }
    });
  }, [expenses, dateRange, selectedState]);


  // Calculate overall statistics with safe defaults
  const stats = useMemo(() => {
    const completedJobs = filteredJobs.filter(j => j?.status === "Completed");
    const revenue = completedJobs.reduce((sum, j) => {
      const price = parseFloat(j?.price) || 0;
      return sum + price;
    }, 0);
    
    const totalExpenses = filteredExpenses.reduce((sum, e) => {
      const amount = parseFloat(e?.amount) || 0;
      return sum + amount;
    }, 0);
    
    const profit = revenue - totalExpenses;
    const today = new Date().toISOString().split('T')[0];

    // Calculate averages safely
    const avgJobValue = completedJobs.length > 0 
      ? (revenue / completedJobs.length).toFixed(2) 
      : "0.00";

    const profitMargin = revenue > 0 
      ? ((profit / revenue) * 100).toFixed(1) 
      : "0.0";

    return {
      totalJobs: filteredJobs.length,
      completedJobs: completedJobs.length,
      todayJobs: filteredJobs.filter(j => j?.date === today).length,
      pendingJobs: filteredJobs.filter(j => j?.status === "Pending").length,
      revenue,
      expenses: totalExpenses,
      profit,
      profitMargin: parseFloat(profitMargin),
      activeCleaners: new Set(
        filteredJobs
          .filter(j => j?.assignedEmployee?._id)
          .map(j => j.assignedEmployee._id)
      ).size,
      totalCleaners: employees.filter(e => e?.role === "Cleaner").length,
      avgJobValue: parseFloat(avgJobValue)
    };
  }, [filteredJobs, filteredExpenses, employees]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 size={28} className="text-gray-900" />
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              <p className="text-gray-600">
                {selectedState === "All" 
                  ? "Overview of your business performance across all states"
                  : `Overview of your business performance in ${selectedState}`
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAllData}
                disabled={refreshLoading}
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={18} className={refreshLoading ? "animate-spin" : ""} />
                {refreshLoading ? "Refreshing..." : "Refresh"}
              </button>
              
              <MonthlyReportDownload />
              
              <button
                onClick={onLock}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                <Lock size={18} />
                Lock Dashboard
              </button>
            </div>
          </div>

          {/* Overall Stats Overview */}
          <DashboardStats stats={stats} />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <DashboardFilters
                from={dateRange.from}
                to={dateRange.to}
                setFrom={(value) => setDateRange(prev => ({ ...prev, from: value }))}
                setTo={(value) => setDateRange(prev => ({ ...prev, to: value }))}
              />
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-gray-500" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="All">All States</option>
                  {STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mb-8">
          <DashboardCharts 
            jobs={filteredJobs} 
            employees={employees}
            expenses={filteredExpenses}
          />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStatCard
            title="Average Job Value"
            value={`$${stats.avgJobValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            color="bg-blue-500"
          />
          <QuickStatCard
            title="Profit Margin"
            value={`${stats.profitMargin.toFixed(1)}%`}
            icon={TrendingUp}
            color={stats.profitMargin >= 0 ? "bg-green-500" : "bg-red-500"}
            trend={stats.profitMargin >= 0 ? "positive" : "negative"}
          />
          <QuickStatCard
            title="Cleaner Utilization"
            value={`${stats.totalCleaners > 0 ? Math.round((stats.activeCleaners / stats.totalCleaners) * 100) : 0}%`}
            icon={Users}
            color="bg-purple-500"
          />
          <QuickStatCard
            title="Completion Rate"
            value={`${stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0}%`}
            icon={CheckCircle}
            color="bg-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}

// QuickStatCard Component
function QuickStatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-1 text-sm ${trend === "positive" ? "text-green-600" : "text-red-600"}`}>
              {trend === "positive" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{trend === "positive" ? "+5.2%" : "-2.1%"}</span>
            </div>
          )}
        </div>
        <div className={`${color} p-2 rounded-lg`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}