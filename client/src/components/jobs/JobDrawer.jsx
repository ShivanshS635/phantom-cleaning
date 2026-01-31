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

export default function JobDrawer({ job, onClose, onRefresh }) {
  const [employees, setEmployees] = useState([]);
  const [selectedCleaner, setSelectedCleaner] = useState(
    job.assignedEmployee?._id || ""
  );
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  const updateStatus = async (status) => {
    if (!window.confirm(`Are you sure you want to mark this job as ${status}?`)) {
      return;
    }

    try {
      setActionLoading(status);
      await api.put(`/jobs/${job._id}/status`, { status });
      showSuccess(`Job marked as ${status}`);
      onRefresh();
      onClose();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
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
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
              <p className="text-sm text-gray-600 mt-1">ID: {job._id?.slice(-8)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Customer Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{job.customerName}</p>
                    <p className="text-sm text-gray-600">Customer</p>
                  </div>
                </div>
                
                {job.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{job.phone}</p>
                      <p className="text-sm text-gray-600">Phone</p>
                    </div>
                  </div>
                )}
                
                {job.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{job.email}</p>
                      <p className="text-sm text-gray-600">Email</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Job Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{job.date}</p>
                    <p className="text-sm text-gray-600">Date</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{job.time || "Flexible"}</p>
                    <p className="text-sm text-gray-600">Time</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{job.state}</p>
                    <p className="text-sm text-gray-600">State</p>
                  </div>
                </div>
                
                {job.price && (
                  <div className="flex items-center gap-3">
                    <DollarSign size={18} className="text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        ${parseFloat(job.price).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Price</p>
                    </div>
                  </div>
                )}
              </div>
              
              {job.address && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Address</p>
                  <p className="text-sm text-gray-600 mt-1">{job.address}</p>
                  {job.city && <p className="text-sm text-gray-600">{job.city}</p>}
                </div>
              )}
              
              {job.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} className="text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">Notes</p>
                  </div>
                  <p className="text-sm text-gray-600">{job.notes}</p>
                </div>
              )}
            </div>

            {/* Cleaner Assignment */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Assignment
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Cleaner
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
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
                  className="mt-3 w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {job.assignedEmployee ? "Update Assignment" : "Assign Cleaner"}
                </button>
              </div>
            </div>

            {/* Status Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Update Status
              </h3>
              <div className="space-y-2">
                {getStatusActions().map((action) => (
                  <button
                    key={action.status}
                    onClick={() => updateStatus(action.status)}
                    disabled={actionLoading === action.status}
                    className={`w-full ${action.color} text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2`}
                  >
                    {actionLoading === action.status ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <action.icon size={18} />
                    )}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}