import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus, Download, Edit2, Trash2, Receipt, DollarSign, Calendar, Loader2,
  ChevronDown, ChevronUp, Search, AlertCircle, CheckCircle, ChevronLeft,
  ChevronRight, MapPin, FileSpreadsheet, SlidersHorizontal, Filter,
} from "lucide-react";
import api from "../../api/axios";
import { showError, showSuccess } from "../../utils/toast";
import ExpenseFormDrawer from "./ExpenseFormDrawer";
import ExpenseCategoryBadge from "./ExpenseCategoryBadge";
import ConfirmationModal from "../common/ConfirmationModal";

const STATUS_STYLE = {
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Reimbursed: "bg-blue-50 text-blue-700 border-blue-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const DEFAULT_DATE_RANGE = { from: "", to: "" };

export default function ExpensesPanel({ filterCategory = "all", filterDateRange = DEFAULT_DATE_RANGE }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stateFilter, setStateFilter] = useState("All");
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: "", message: "", onConfirm: null, type: "danger", isLoading: false,
  });

  const [pagination, setPagination] = useState({
    page: 1, limit: 50, total: 0, pages: 1,
  });

  const [summary, setSummary] = useState({
    totalAmount: 0, pendingAmount: 0, paidAmount: 0, count: 0,
  });

  const categories = [
    "Supplies", "Equipment", "Travel", "Marketing", "Office",
    "Software", "Services", "Training", "Salary", "Other",
  ];

  const fetchExpenses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        category: filterCategory !== "all" ? filterCategory : undefined,
        startDate: filterDateRange?.from || undefined,
        endDate: filterDateRange?.to || undefined,
        state: stateFilter !== "All" ? stateFilter : undefined,
        search: searchQuery || undefined,
        sortBy, sortOrder, page, limit: pagination.limit,
      };
      Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);

      const res = await api.get("/expenses", { params });
      if (res.data.success) {
        setExpenses(res.data.data || []);
        setPagination({
          page: res.data.page || 1, limit: pagination.limit,
          total: res.data.total || 0, pages: res.data.pages || 1,
        });
        if (res.data.summary) setSummary(res.data.summary);
      } else {
        showError(res.data.message || "Failed to load expenses");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterDateRange, stateFilter, searchQuery, sortBy, sortOrder, pagination.limit]);

  useEffect(() => { fetchExpenses(1); }, [fetchExpenses]);

  // ── Bulk delete ──
  const bulkDelete = () => {
    if (!selectedExpenses.length) return;
    setConfirmModal({
      isOpen: true,
      title: "Delete Selected",
      message: `Permanently delete ${selectedExpenses.length} expense${selectedExpenses.length > 1 ? "s" : ""}? This cannot be undone.`,
      type: "danger", confirmText: "Delete All",
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, isLoading: true }));
        try {
          const res = await api.delete("/expenses", { data: { ids: selectedExpenses } });
          if (res.data.success) {
            showSuccess(`${selectedExpenses.length} expenses deleted`);
            setSelectedExpenses([]);
            fetchExpenses(pagination.page);
          } else showError(res.data.message || "Failed to delete");
        } catch (err) {
          showError(err.response?.data?.message || "Delete failed");
        } finally {
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, type: "danger", isLoading: false });
        }
      },
    });
  };

  const toggleSelectAll = () =>
    setSelectedExpenses(p => p.length === expenses.length ? [] : expenses.map(e => e._id));

  const toggleSelectExpense = (id) =>
    setSelectedExpenses(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const updateExpenseStatus = async (id, status) => {
    try {
      const res = await api.patch(`/expenses/${id}/status`, { status });
      if (res.data.success) { showSuccess("Status updated"); fetchExpenses(pagination.page); }
      else showError(res.data.message || "Failed to update status");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleEdit = (expense) => { setEditingExpense(expense); setShowForm(true); };

  const deleteExpense = (id) => {
    setConfirmModal({
      isOpen: true, title: "Delete Expense",
      message: "Permanently delete this expense? This cannot be undone.",
      type: "danger", confirmText: "Delete",
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, isLoading: true }));
        try {
          await api.delete(`/expenses/${id}`);
          showSuccess("Expense deleted");
          fetchExpenses(pagination.page);
        } catch (err) {
          showError(err.response?.data?.message || "Delete failed");
        } finally {
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, type: "danger", isLoading: false });
        }
      },
    });
  };

  const handlePageChange = (p) => {
    if (p >= 1 && p <= pagination.pages) fetchExpenses(p);
  };

  const displayTotal = useMemo(() =>
    expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0),
    [expenses]
  );

  // ── CSV Export ──
  const exportExpenses = async () => {
    try {
      const params = {
        category: filterCategory !== "all" ? filterCategory : undefined,
        startDate: filterDateRange?.from || undefined,
        endDate: filterDateRange?.to || undefined,
        search: searchQuery || undefined, limit: 10000,
      };
      Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
      const res = await api.get("/expenses", { params });
      if (res.data.success) {
        const csvData = [
          ["Title", "Amount", "Date", "Category", "Status", "Description", "Payment Method"],
          ...res.data.data.map(e => [
            e.title, e.amount, new Date(e.date).toLocaleDateString(),
            e.category, e.status, e.description || "", e.paymentMethod || "",
          ]),
        ];
        const csvString = csvData.map(row =>
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ).join("\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `expenses-${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess("Exported to CSV");
      }
    } catch { showError("Failed to export CSV"); }
  };

  // ── Excel Export ──
  const exportExpensesExcel = async () => {
    try {
      const params = {
        category: filterCategory !== "all" ? filterCategory : undefined,
        startDate: filterDateRange?.from || undefined,
        endDate: filterDateRange?.to || undefined,
        search: searchQuery || undefined,
        state: stateFilter !== "All" ? stateFilter : undefined,
      };
      Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
      const res = await api.get("/expenses/export/excel", { params, responseType: "blob" });
      const contentType = res.headers["content-type"] || "";
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      if (blob.size < 500) {
        const text = await blob.text();
        try { const err = JSON.parse(text); showError(err.message || "Excel export failed"); }
        catch { showError(`Export failed: ${text.substring(0, 100)}`); }
        return;
      }
      if (contentType.includes("application/json")) {
        const text = await blob.text();
        const err = JSON.parse(text);
        showError(err.message || "Excel export failed"); return;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `expenses-${new Date().toISOString().split("T")[0]}.xlsx`);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { document.body.removeChild(link); window.URL.revokeObjectURL(url); }, 100);
      showSuccess("Excel file downloaded");
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try { const e = JSON.parse(text); showError(e.message || "Excel export failed"); }
        catch { showError("Excel export failed"); }
      } else {
        showError(err.response?.data?.message || "Excel export failed");
      }
    }
  };

  return (
    <div className="card overflow-hidden">
      {/* ── Header ── */}
      <div className="border-b border-surface-3 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600/10 flex items-center justify-center">
              <Receipt size={18} className="text-brand-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink-primary">Expense Records</h2>
              <p className="text-xs text-ink-muted">
                {pagination.total} expenses
                {summary.totalAmount ? ` · $${summary.totalAmount.toLocaleString()} total` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedExpenses.length > 0 && (
              <button
                onClick={bulkDelete}
                className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                <Trash2 size={14} />
                Delete ({selectedExpenses.length})
              </button>
            )}
            <button onClick={exportExpenses} className="btn-secondary text-sm">
              <Download size={14} />
              CSV
            </button>
            <button onClick={exportExpensesExcel} className="btn-secondary text-sm">
              <FileSpreadsheet size={14} />
              Excel
            </button>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
              <Plus size={14} />
              Add Expense
            </button>
          </div>
        </div>

        {/* Summary pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total", value: `$${(summary.totalAmount || 0).toLocaleString()}`, color: "bg-brand-50 text-brand-700 border-brand-100" },
            { label: "Paid", value: `$${(summary.paidAmount || 0).toLocaleString()}`, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
            { label: "Pending", value: `$${(summary.pendingAmount || 0).toLocaleString()}`, color: "bg-amber-50 text-amber-700 border-amber-100" },
            { label: "Avg.", value: `$${summary.count > 0 ? (summary.totalAmount / summary.count).toFixed(0) : 0}`, color: "bg-surface-2 text-ink-secondary border-surface-3" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl p-3 border ${color}`}>
              <p className="text-xs font-medium opacity-70">{label}</p>
              <p className="text-lg font-bold mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="p-4 border-b border-surface-3 bg-surface-1">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Search by title, category…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchExpenses(1)}
              className="input-premium pl-9 py-2.5 text-sm"
            />
          </div>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="input-premium pl-8 pr-10 py-2.5 text-sm w-40 appearance-none"
            >
              <option value="All">All States</option>
              {["Sydney", "Melbourne", "Brisbane", "Adelaide", "Perth"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-premium pl-8 pr-10 py-2.5 text-sm w-40 appearance-none"
            >
              <option value="date">Sort: Date</option>
              <option value="amount">Sort: Amount</option>
              <option value="title">Sort: Title</option>
            </select>
          </div>
          <button
            onClick={() => { setSortOrder(o => o === "asc" ? "desc" : "asc"); fetchExpenses(1); }}
            className="btn-secondary text-sm px-4"
          >
            {sortOrder === "asc" ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center mx-auto">
                <Loader2 size={20} className="text-brand-600 animate-spin" />
              </div>
              <p className="text-sm text-ink-muted">Loading expenses…</p>
            </div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-ink-muted" />
            </div>
            <h3 className="text-base font-semibold text-ink-primary mb-1">No expenses found</h3>
            <p className="text-sm text-ink-muted mb-5">
              {searchQuery || filterCategory !== "all"
                ? "Try adjusting your filters"
                : "Add your first expense record"}
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">
              <Plus size={16} /> Add Expense
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-3 bg-surface-1">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedExpenses.length === expenses.length && expenses.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-surface-3 text-brand-600 focus:ring-brand-500"
                  />
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Expense</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Category</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-right text-xs font-semibold text-ink-muted uppercase tracking-wider">Amount</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-right text-xs font-semibold text-ink-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-3">
              {expenses.map((expense) => (
                <tr key={expense._id} className="table-row-hover group">
                  <td className="py-3.5 px-4">
                    <input
                      type="checkbox"
                      checked={selectedExpenses.includes(expense._id)}
                      onChange={() => toggleSelectExpense(expense._id)}
                      className="rounded border-surface-3 text-brand-600 focus:ring-brand-500"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-sm font-semibold text-ink-primary">{expense.title}</p>
                    {expense.description && (
                      <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{expense.description}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <ExpenseCategoryBadge category={expense.category} />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-ink-muted" />
                      <span className="text-sm text-ink-secondary">
                        {new Date(expense.date).toLocaleDateString("en-AU", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-sm font-bold text-ink-primary">
                      ${parseFloat(expense.amount).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`badge border ${STATUS_STYLE[expense.status] || STATUS_STYLE.Pending}`}>
                        {expense.status === "Paid" && <CheckCircle size={10} />}
                        {expense.status || "Pending"}
                      </span>
                      {expense.status === "Pending" && (
                        <button
                          onClick={() => updateExpenseStatus(expense._id, "Paid")}
                          className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-1.5 rounded-lg hover:bg-brand-50 hover:text-brand-600 text-ink-muted transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteExpense(expense._id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-ink-muted transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                      {expense.receipt && (
                        <button
                          onClick={() => window.open(expense.receipt, "_blank")}
                          className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-ink-muted transition-colors"
                          title="View Receipt"
                        >
                          <Receipt size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination.pages > 1 && (
        <div className="border-t border-surface-3 px-5 py-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-muted">
              Showing{" "}
              <span className="font-semibold text-ink-primary">
                {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-semibold text-ink-primary">{pagination.total}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-xl border border-surface-3 disabled:opacity-40 hover:bg-surface-1 transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) pageNum = i + 1;
                else if (pagination.page <= 3) pageNum = i + 1;
                else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
                else pageNum = pagination.page - 2 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-medium transition-colors ${pagination.page === pageNum
                      ? "bg-brand-600 text-white"
                      : "border border-surface-3 text-ink-secondary hover:bg-surface-1"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-2 rounded-xl border border-surface-3 disabled:opacity-40 hover:bg-surface-1 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      {expenses.length > 0 && (
        <div className="border-t border-surface-3 px-5 py-3 bg-surface-1 flex items-center justify-between">
          <p className="text-xs text-ink-muted">
            Page <span className="font-medium text-ink-primary">{pagination.page}</span> of{" "}
            <span className="font-medium text-ink-primary">{pagination.pages}</span>
            {selectedExpenses.length > 0 && ` · ${selectedExpenses.length} selected`}
          </p>
          <p className="text-xs font-medium text-ink-primary">
            Display total: <span className="text-sm font-bold">${displayTotal.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        </div>
      )}

      {/* ── Drawers/Modals ── */}
      {showForm && (
        <ExpenseFormDrawer
          expense={editingExpense}
          onClose={() => { setShowForm(false); setEditingExpense(null); }}
          onSuccess={() => { setShowForm(false); setEditingExpense(null); fetchExpenses(pagination.page); }}
          categories={categories}
        />
      )}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
}