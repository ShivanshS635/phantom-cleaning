// ExpenseFormDrawer.jsx - Updated for new backend
import { useState, useEffect } from "react";
import { 
  X, 
  DollarSign, 
  Calendar, 
  Tag, 
  Upload,
  Loader2,
  Receipt,
  CheckCircle,
  CreditCard,
  Building
} from "lucide-react";
import api from "../../api/axios";
import { showSuccess, showError } from "../../utils/toast";

export default function ExpenseFormDrawer({ expense, onClose, onSuccess, categories }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const paymentMethods = ["Cash", "Credit Card", "Bank Transfer", "PayPal", "Other"];
  const statusOptions = ["Pending", "Paid", "Reimbursed", "Cancelled"];

  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "Supplies",
    description: "",
    status: "Pending",
    receipt: "",
    paymentMethod: "Credit Card",
    vendor: ""
  });

  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title || "",
        amount: expense.amount || "",
        date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split("T")[0],
        category: expense.category || "Supplies",
        description: expense.description || "",
        status: expense.status || "Pending",
        receipt: expense.receipt || "",
        paymentMethod: expense.paymentMethod || "Credit Card",
        vendor: expense.vendor || ""
      });
    }
  }, [expense]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // In a real app, upload to cloud storage here
      const formData = new FormData();
      formData.append('receipt', file);
      
      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data.success) {
        setForm(prev => ({ ...prev, receipt: res.data.url }));
        showSuccess("Receipt uploaded successfully");
      } else {
        showError(res.data.message || "Failed to upload receipt");
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to upload receipt");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (expense) {
        const res = await api.put(`/expenses/${expense._id}`, form);
        if (res.data.success) {
          showSuccess("Expense updated successfully");
          onSuccess();
        } else {
          showError(res.data.message || "Failed to update expense");
        }
      } else {
        const res = await api.post("/expenses", form);
        if (res.data.success) {
          showSuccess("Expense added successfully");
          onSuccess();
        } else {
          showError(res.data.message || "Failed to add expense");
        }
      }
    } catch (error) {
      showError(error.response?.data?.message || expense ? "Failed to update expense" : "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {expense ? "Edit Expense" : "Add New Expense"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Fill in the expense details below
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Office supplies purchase"
                required
              />
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white"
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Payment Method & Vendor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="vendor"
                    value={form.vendor}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Vendor name"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                placeholder="Additional details about this expense..."
              />
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {form.receipt ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle size={20} />
                      <span className="font-medium">Receipt uploaded</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Receipt size={16} className="text-gray-400" />
                      <a 
                        href={form.receipt} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View receipt
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, receipt: "" }))}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove receipt
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto text-gray-400 mb-3" size={32} />
                    <p className="text-sm text-gray-600 mb-3">
                      Upload receipt image or PDF
                    </p>
                    <label className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg cursor-pointer">
                      {uploading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Choose File
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-3">
                      JPG, PNG or PDF (Max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                disabled={loading || uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {(loading || uploading) && <Loader2 size={20} className="animate-spin" />}
                {expense ? "Update Expense" : "Add Expense"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}