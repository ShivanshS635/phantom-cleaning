// JobDrawer.jsx
import { useEffect, useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2
} from "lucide-react";
import api from "../../api/axios";
import { showSuccess, showError } from "../../utils/toast";

export default function JobDrawer({ job, onClose, onRefresh, onUpdateStatus }) {
  const [employees, setEmployees] = useState([]);
  const [selectedCleaner, setSelectedCleaner] = useState(
    job.assignedEmployee?._id || ""
  );
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      showError("Failed to load employees");
    }
  };

  const updateCleaner = async () => {
    try {
      setLoading(true);
      await api.put(`/jobs/${job._id}/assign`, {
        employeeId: selectedCleaner || null
      });
      showSuccess("Cleaner assigned successfully");
      onRefresh();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update cleaner");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (status) => {
    if (onUpdateStatus) {
      onUpdateStatus(job._id, status, () => {
        onRefresh();
        onClose();
      });
    }
  };

  const getStatusActions = () => {
    const actions = [];

    if (job.status !== "Completed" && job.status !== "Cancelled") {
      actions.push({
        label: "Mark as Completed",
        color: "bg-emerald-600 hover:bg-emerald-700",
        icon: CheckCircle,
        status: "Completed"
      });
    }

    if (job.status === "Completed") {
      actions.push({
        label: "Mark as Redo",
        color: "bg-orange-500 hover:bg-orange-600",
        icon: RefreshCw,
        status: "Redo"
      });
    }

    if (job.status !== "Cancelled") {
      actions.push({
        label: "Cancel Job",
        color: "bg-red-600 hover:bg-red-700",
        icon: XCircle,
        status: "Cancelled"
      });
    }

    return actions;
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md">
        <div className="h-full bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="px-5 md:px-6 py-4 border-b border-surface-3 flex items-center justify-between bg-surface-1">
            <div>
              <h2 className="text-xl font-bold text-ink-primary">Job Details</h2>
              <p className="text-xs text-ink-muted mt-0.5">ID: {job._id?.slice(-8)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-2 rounded-xl text-ink-muted transition-all"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-ink-primary uppercase tracking-widest">
                Customer Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
                    <User size={16} className="text-ink-secondary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-primary truncate">{job.customerName}</p>
                    <p className="text-[11px] text-ink-muted uppercase tracking-wider mt-0.5">Customer</p>
                  </div>
                </div>

                {job.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
                      <Phone size={16} className="text-ink-secondary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-primary truncate">{job.phone}</p>
                      <p className="text-[11px] text-ink-muted uppercase tracking-wider mt-0.5">Phone</p>
                    </div>
                  </div>
                )}

                {job.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
                      <Mail size={16} className="text-ink-secondary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-primary truncate">{job.email}</p>
                      <p className="text-[11px] text-ink-muted uppercase tracking-wider mt-0.5">Email</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-ink-primary uppercase tracking-widest">
                Job Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-surface-1 p-3 rounded-xl border border-surface-3">
                  <Calendar size={18} className="text-brand-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-primary truncate">{job.date}</p>
                    <p className="text-[10px] text-ink-muted uppercase tracking-wider mt-0.5">Date</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-surface-1 p-3 rounded-xl border border-surface-3">
                  <Clock size={18} className="text-brand-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-primary truncate">{job.time || "Flexible"}</p>
                    <p className="text-[10px] text-ink-muted uppercase tracking-wider mt-0.5">Time</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-surface-1 p-3 rounded-xl border border-surface-3">
                  <MapPin size={18} className="text-brand-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-primary truncate">{job.state}</p>
                    <p className="text-[10px] text-ink-muted uppercase tracking-wider mt-0.5">State</p>
                  </div>
                </div>

                {job.price && (
                  <div className="flex items-center gap-3 bg-surface-1 p-3 rounded-xl border border-surface-3">
                    <DollarSign size={18} className="text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-primary truncate">
                        ${parseFloat(job.price).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-ink-muted uppercase tracking-wider mt-0.5">Price</p>
                    </div>
                  </div>
                )}
              </div>

              {job.address && (
                <div className="p-4 bg-surface-1 rounded-xl border border-surface-3">
                  <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-1.5">Address</p>
                  <p className="text-sm font-medium text-ink-primary">{job.address}</p>
                  {job.city && <p className="text-sm text-ink-secondary mt-0.5">{job.city}</p>}
                </div>
              )}

              {job.notes && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-amber-600" />
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">Notes</p>
                  </div>
                  <p className="text-sm text-amber-900">{job.notes}</p>
                </div>
              )}
            </div>

            {/* Cleaner Assignment */}
            <div className="space-y-4 pt-4 border-t border-surface-3">
              <h3 className="text-xs font-bold text-ink-primary uppercase tracking-widest">
                Assignment
              </h3>
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider flex items-center gap-2">
                  Assign Cleaner
                </label>
                <select
                  className="input-premium"
                  value={selectedCleaner}
                  onChange={(e) => setSelectedCleaner(e.target.value)}
                >
                  <option value="">Select a cleaner</option>
                  {employees
                    .filter(e => e.role === "Cleaner")
                    .map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} • {emp.state}
                      </option>
                    ))}
                </select>
                <button
                  onClick={updateCleaner}
                  disabled={loading}
                  className="btn-primary w-full shadow-brand relative"
                >
                  {loading && <Loader2 size={16} className="animate-spin absolute left-4" />}
                  {job.assignedEmployee ? "Update Assignment" : "Assign Cleaner"}
                </button>
              </div>
            </div>

            {/* Status Actions */}
            <div className="space-y-4 pt-4 border-t border-surface-3">
              <h3 className="text-xs font-bold text-ink-primary uppercase tracking-widest">
                Update Status
              </h3>
              <div className="space-y-2">
                {getStatusActions().map((action) => (
                  <button
                    key={action.status}
                    onClick={() => updateStatus(action.status)}
                    className={`w-full ${action.color} text-white py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2`}
                  >
                    <action.icon size={18} />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}