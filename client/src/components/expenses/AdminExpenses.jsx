// AdminExpenses.jsx - Updated with real data
import { useState, useEffect, useCallback } from "react";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import api from "../../api/axios";
import { showError } from "../../utils/toast";
import ExpensesPanel from "./ExpensesPanel";
import ExpenseFilters from "./ExpenseFilters";

export default function AdminExpenses() {
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState({
    from: "",
    to: ""
  });
  const [expenseStats, setExpenseStats] = useState({
    totalAmount: 0,
    byCategory: [],
    monthlyTrend: [],
    statusBreakdown: []
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchExpenseStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const params = {
        startDate: filterDateRange.from || undefined,
        endDate: filterDateRange.to || undefined
      };

      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );

      const res = await api.get("/expenses/stats/summary", { params });
      
      if (res.data.success) {
        setExpenseStats(res.data.data);
      } else {
        showError(res.data.message || "Failed to load expense statistics");
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to load statistics");
    } finally {
      setLoadingStats(false);
    }
  }, [filterDateRange]);

  useEffect(() => {
    fetchExpenseStats();
  }, [fetchExpenseStats]);

  const exportExpenses = async () => {
    try {
      const params = {
        category: filterCategory !== "all" ? filterCategory : undefined,
        startDate: filterDateRange.from || undefined,
        endDate: filterDateRange.to || undefined,
        limit: 10000 // Get all for export
      };

      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );

      const res = await api.get("/expenses", { params });
      
      if (res.data.success) {
        // Create CSV data
        const csvData = [
          ["Title", "Amount", "Date", "Category", "Status", "Description", "Vendor", "Payment Method"],
          ...res.data.data.map(expense => [
            expense.title,
            expense.amount,
            new Date(expense.date).toLocaleDateString(),
            expense.category,
            expense.status,
            expense.description || '',
            expense.vendor || '',
            expense.paymentMethod || ''
          ])
        ];

        // Convert to CSV string
        const csvString = csvData.map(row => 
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        // Create download link
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `expenses-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      showError("Failed to export expenses");
    }
  };

  // Calculate month-over-month change
  const calculateMonthChange = () => {
    if (!expenseStats.monthlyTrend || expenseStats.monthlyTrend.length < 2) {
      return { value: 0, isPositive: true };
    }
    
    const current = expenseStats.monthlyTrend[expenseStats.monthlyTrend.length - 1];
    const previous = expenseStats.monthlyTrend[expenseStats.monthlyTrend.length - 2];
    
    if (!current || !previous || previous.totalAmount === 0) {
      return { value: 0, isPositive: true };
    }
    
    const change = ((current.totalAmount - previous.totalAmount) / previous.totalAmount) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  };

  const monthChange = calculateMonthChange();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
              <p className="text-gray-600 mt-2">Track and manage business expenses</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportExpenses}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Download size={20} />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Expenses */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-500 p-2 rounded-lg">
                <span className="text-white font-bold">$</span>
              </div>
              <span className={`text-sm font-medium ${
                monthChange.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {monthChange.isPositive ? 
                  <TrendingUp className="inline mr-1" size={14} /> : 
                  <TrendingDown className="inline mr-1" size={14} />
                }
                {monthChange.value}%
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${expenseStats.totals?.totalAmount?.toLocaleString() || "0"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {expenseStats.totals?.count || 0} expenses
              </p>
            </div>
          </div>

          {/* Average per Expense */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 p-2 rounded-lg">
                <span className="text-white font-bold">Ø</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average per Expense</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${expenseStats.totals?.avgAmount?.toFixed(2) || "0"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                per transaction
              </p>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <span className="text-white font-bold">M</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${expenseStats.monthlyTrend?.[expenseStats.monthlyTrend.length - 1]?.totalAmount?.toLocaleString() || "0"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Current month total
              </p>
            </div>
          </div>

          {/* Pending Amount */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500 p-2 rounded-lg">
                <span className="text-white font-bold">!</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${expenseStats.statusBreakdown?.find(s => s._id === "Pending")?.totalAmount?.toLocaleString() || "0"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {expenseStats.statusBreakdown?.find(s => s._id === "Pending")?.count || 0} expenses pending
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ExpenseFilters
            category={filterCategory}
            dateRange={filterDateRange}
            onCategoryChange={setFilterCategory}
            onDateRangeChange={setFilterDateRange}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ExpensesPanel
              filterCategory={filterCategory}
              filterDateRange={filterDateRange}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Expense Categories Breakdown */}
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Expense Categories</h3>
                {loadingStats && (
                  <span className="text-sm text-gray-500">Loading...</span>
                )}
              </div>
              {loadingStats ? (
                <div className="text-center py-8">
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : expenseStats.byCategory?.length > 0 ? (
                <div className="space-y-3">
                  {expenseStats.byCategory.slice(0, 5).map((item) => (
                    <div key={item._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item._id === "Supplies" ? "bg-blue-500" :
                          item._id === "Equipment" ? "bg-purple-500" :
                          item._id === "Travel" ? "bg-yellow-500" :
                          item._id === "Marketing" ? "bg-green-500" :
                          item._id === "Office" ? "bg-red-500" :
                          item._id === "Software" ? "bg-indigo-500" :
                          item._id === "Services" ? "bg-pink-500" :
                          "bg-gray-500"
                        }`} />
                        <span className="text-sm text-gray-700">{item._id}</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        ${item.totalAmount?.toLocaleString() || "0"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No category data available
                </div>
              )}
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Trend</h3>
                {loadingStats && (
                  <span className="text-sm text-gray-500">Loading...</span>
                )}
              </div>
              {loadingStats ? (
                <div className="text-center py-8">
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <div className="h-3 bg-gray-200 rounded w-8"></div>
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : expenseStats.monthlyTrend?.length > 0 ? (
                <div className="space-y-4">
                  {expenseStats.monthlyTrend.slice(-5).map((item) => {
                    const monthName = new Date(0, item._id.month - 1).toLocaleString('default', { month: 'short' });
                    const year = item._id.year;
                    const maxAmount = Math.max(...expenseStats.monthlyTrend.map(m => m.totalAmount));
                    
                    return (
                      <div key={`${year}-${item._id.month}`}>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>{`${monthName} ${year}`}</span>
                          <span>${item.totalAmount?.toLocaleString() || "0"}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full" 
                            style={{ 
                              width: `${maxAmount > 0 ? (item.totalAmount / maxAmount) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No trend data available
                </div>
              )}
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
              {loadingStats ? (
                <div className="text-center py-8">
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : expenseStats.statusBreakdown?.length > 0 ? (
                <div className="space-y-3">
                  {expenseStats.statusBreakdown.map((item) => (
                    <div key={item._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item._id === "Paid" ? "bg-green-500" :
                          item._id === "Pending" ? "bg-yellow-500" :
                          item._id === "Reimbursed" ? "bg-blue-500" :
                          "bg-red-500"
                        }`} />
                        <span className="text-sm text-gray-700">{item._id}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-900">
                          ${item.totalAmount?.toLocaleString() || "0"}
                        </span>
                        <span className="text-xs text-gray-500 block">
                          {item.count} expenses
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No status data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}