import { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Plus, 
  Download, 
  Edit2, 
  Trash2, 
  Receipt,
  DollarSign,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
  Search,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import api from "../../api/axios";
import { showError, showSuccess } from "../../utils/toast";
import ExpenseFormDrawer from "./ExpenseFormDrawer";
import ExpenseCategoryBadge from "./ExpenseCategoryBadge";

export default function ExpensesPanel({ filterCategory, filterDateRange }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1
  });
  
  // Summary state
  const [summary, setSummary] = useState({
    totalAmount: 0,
    pendingAmount: 0,
    paidAmount: 0,
    count: 0
  });

  const categories = [
    "Supplies", "Equipment", "Travel", "Marketing", "Office", 
    "Software", "Services", "Training", "Other"
  ];

  const fetchExpenses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        category: filterCategory !== "all" ? filterCategory : undefined,
        startDate: filterDateRange.from || undefined,
        endDate: filterDateRange.to || undefined,
        search: searchQuery || undefined,
        sortBy,
        sortOrder,
        page,
        limit: pagination.limit
      };

      // Remove undefined params
      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );

      const res = await api.get("/expenses", { params });
      
      if (res.data.success) {
        setExpenses(res.data.data || []);
        setPagination({
          page: res.data.page || 1,
          limit: pagination.limit,
          total: res.data.total || 0,
          pages: res.data.pages || 1
        });
        
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      } else {
        showError(res.data.message || "Failed to load expenses");
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterDateRange, searchQuery, sortBy, sortOrder, pagination.limit]);

  useEffect(() => {
    fetchExpenses(1);
  }, [fetchExpenses]);

  const deleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      const res = await api.delete(`/expenses/${id}`);
      if (res.data.success) {
        showSuccess("Expense deleted successfully");
        fetchExpenses(pagination.page);
        // Remove from selected if it was selected
        setSelectedExpenses(prev => prev.filter(expenseId => expenseId !== id));
      } else {
        showError(res.data.message || "Failed to delete expense");
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete expense");
    }
  };

  const bulkDelete = async () => {
    if (selectedExpenses.length === 0) return;
    
    if (!window.confirm(`Delete ${selectedExpenses.length} selected expenses?`)) return;
    
    try {
      const res = await api.delete("/expenses", { data: { ids: selectedExpenses } });
      if (res.data.success) {
        showSuccess(`${selectedExpenses.length} expenses deleted`);
        setSelectedExpenses([]);
        fetchExpenses(pagination.page);
      } else {
        showError(res.data.message || "Failed to delete expenses");
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete expenses");
    }
  };

  const toggleSelectAll = () => {
    if (selectedExpenses.length === expenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(expenses.map(e => e._id));
    }
  };

  const toggleSelectExpense = (id) => {
    setSelectedExpenses(prev => 
      prev.includes(id) 
        ? prev.filter(expenseId => expenseId !== id)
        : [...prev, id]
    );
  };

  const updateExpenseStatus = async (id, status) => {
    try {
      const res = await api.patch(`/expenses/${id}/status`, { status });
      if (res.data.success) {
        showSuccess("Expense status updated");
        fetchExpenses(pagination.page);
      } else {
        showError(res.data.message || "Failed to update status");
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchExpenses(newPage);
    }
  };

  // Calculate total from filtered expenses for display
  const displayTotal = useMemo(() => 
    expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0), 
    [expenses]
  );

  const exportExpenses = async () => {
    try {
      const params = {
        category: filterCategory !== "all" ? filterCategory : undefined,
        startDate: filterDateRange.from || undefined,
        endDate: filterDateRange.to || undefined,
        search: searchQuery || undefined,
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
        
        showSuccess("Expenses exported successfully");
      }
    } catch (error) {
      showError("Failed to export expenses");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
      {/* Header with Summary */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Expense Records</h2>
            <p className="text-gray-600 mt-1">
              {pagination.total} expenses • Total: ${summary.totalAmount?.toLocaleString() || "0"}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedExpenses.length > 0 && (
              <button
                onClick={bulkDelete}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                <Trash2 size={18} />
                Delete Selected ({selectedExpenses.length})
              </button>
            )}
            
            <button
              onClick={exportExpenses}
              className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              Export
            </button>
            
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium"
            >
              <Plus size={20} />
              Add Expense
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-700">Total Amount</p>
            <p className="text-xl font-bold text-blue-900 mt-1">
              ${summary.totalAmount?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-3">
            <p className="text-sm font-medium text-green-700">Paid</p>
            <p className="text-xl font-bold text-green-900 mt-1">
              ${summary.paidAmount?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
            <p className="text-sm font-medium text-yellow-700">Pending</p>
            <p className="text-xl font-bold text-yellow-900 mt-1">
              ${summary.pendingAmount?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700">Average</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              ${summary.count > 0 ? (summary.totalAmount / summary.count).toFixed(2) : "0"}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search expenses by title, description, vendor, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchExpenses(1)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="md:col-span-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
          
          <div className="md:col-span-3">
            <button
              onClick={() => {
                const newOrder = sortOrder === "asc" ? "desc" : "asc";
                setSortOrder(newOrder);
                fetchExpenses(1);
              }}
              className="w-full inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === "asc" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 size={40} className="text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading expenses...</p>
            </div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No expenses found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterCategory !== "all" 
                ? "Try adjusting your search or filters"
                : "Get started by adding your first expense"
              }
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium"
            >
              <Plus size={20} />
              Add Expense
            </button>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedExpenses.length === expenses.length && expenses.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Expense</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr 
                    key={expense._id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedExpenses.includes(expense._id)}
                        onChange={() => toggleSelectExpense(expense._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{expense.title}</p>
                        {expense.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                            {expense.description}
                          </p>
                        )}
                        {expense.vendor && (
                          <p className="text-xs text-gray-500 mt-1">
                            Vendor: {expense.vendor}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <ExpenseCategoryBadge category={expense.category} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-700">
                          {new Date(expense.date).toLocaleDateString('en-AU', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-900">
                          ${parseFloat(expense.amount).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          expense.status === 'Paid' 
                            ? 'bg-green-100 text-green-700'
                            : expense.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : expense.status === 'Reimbursed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {expense.status === 'Paid' && <CheckCircle size={10} />}
                          {expense.status || 'Pending'}
                        </span>
                        {expense.status === 'Pending' && (
                          <button
                            onClick={() => updateExpenseStatus(expense._id, 'Paid')}
                            className="text-xs text-green-600 hover:text-green-700 hover:underline"
                            title="Mark as Paid"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteExpense(expense._id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        {expense.receipt && (
                          <button
                            onClick={() => window.open(expense.receipt, '_blank')}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Receipt"
                          >
                            <Receipt size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} expenses
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm ${
                              pagination.page === pageNum
                                ? 'bg-gray-900 text-white'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Summary */}
      {expenses.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
              {selectedExpenses.length > 0 && ` • ${selectedExpenses.length} selected`}
            </div>
            <div className="font-medium text-gray-900">
              Display Total: ${displayTotal.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Expense Form Drawer */}
      {showForm && (
        <ExpenseFormDrawer
          expense={editingExpense}
          onClose={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingExpense(null);
            fetchExpenses(pagination.page);
          }}
          categories={categories}
        />
      )}
    </div>
  );
}