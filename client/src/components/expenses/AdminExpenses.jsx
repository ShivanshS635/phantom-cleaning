// AdminExpenses.jsx — wrapper with premium stat cards
import { useEffect, useState } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, Receipt, CreditCard,
} from "lucide-react";
import api from "../../api/axios";
import { showError } from "../../utils/toast";
import ExpensesPanel from "./ExpensesPanel";


export default function AdminExpenses() {
  const [expenseStats, setExpenseStats] = useState(null);
  const [selectedState] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get("/expenses");
        const data = res.data?.data || res.data || [];
        const arr = Array.isArray(data) ? data : [];

        const total = arr.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
        const now = new Date();
        const thisMonth = arr.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const lastMonth = arr.filter(e => {
          const d = new Date(e.date);
          const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
        });
        const thisMonthTotal = thisMonth.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
        const lastMonthTotal = lastMonth.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
        const trend = lastMonthTotal > 0
          ? (((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)
          : null;

        const byCategory = arr.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + (parseFloat(e.amount) || 0);
          return acc;
        }, {});
        const topCategory = Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0];

        setExpenseStats({ total, thisMonthTotal, trend, topCategory, count: arr.length });
      } catch {
        showError("Failed to load expense stats");
      } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const statCards = expenseStats ? [
    {
      label: "Total Expenses",
      value: `$${expenseStats.total.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      gradient: "from-rose-500 to-red-500",
      border: "border-rose-100",
    },
    {
      label: "This Month",
      value: `$${expenseStats.thisMonthTotal.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CreditCard,
      gradient: "from-brand-500 to-blue-500",
      border: "border-brand-100",
      sub: expenseStats.trend !== null
        ? `${expenseStats.trend > 0 ? "▲" : "▼"} ${Math.abs(expenseStats.trend)}% vs last month`
        : "No prior month data",
    },
    {
      label: "Total Records",
      value: expenseStats.count,
      icon: Receipt,
      gradient: "from-purple-500 to-violet-500",
      border: "border-purple-100",
    },
    {
      label: "Top Category",
      value: expenseStats.topCategory ? expenseStats.topCategory[0] : "—",
      icon: expenseStats.trend >= 0 ? TrendingUp : TrendingDown,
      gradient: "from-amber-500 to-orange-500",
      border: "border-amber-100",
      sub: expenseStats.topCategory
        ? `$${expenseStats.topCategory[1].toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : null,
    },
  ] : [];

  return (
    <div className="min-h-screen bg-surface-1">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="stat-card space-y-3">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-6 w-32" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className={`stat-card border ${card.border} animate-fade-up`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm mb-4`}>
                  <card.icon size={18} className="text-white" />
                </div>
                <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">{card.label}</p>
                <p className="text-xl font-bold text-ink-primary mt-0.5">{card.value}</p>
                {card.sub && <p className="text-xs text-ink-muted mt-1">{card.sub}</p>}
                <div className={`mt-4 h-0.5 rounded-full bg-gradient-to-r ${card.gradient} opacity-30`} />
              </div>
            ))}
          </div>
        )}

        {/* Expenses Panel */}
        <ExpensesPanel selectedState={selectedState} />
      </div>
    </div>
  );
}