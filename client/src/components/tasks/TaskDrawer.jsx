// TaskDrawer.jsx
import { useState } from "react";
import {
  X,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  FileText,
  Loader2
} from "lucide-react";
import api from "../../api/axios";
import { showSuccess, showError } from "../../utils/toast";

export default function TaskDrawer({ task, onClose, onRefresh, onUpdateStatus }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [notes, setNotes] = useState(task?.notes || "");

  if (!task) return null;

  const updateStatus = (status) => {
    if (onUpdateStatus) {
      onUpdateStatus(task._id, status, () => {
        onRefresh?.();
        onClose();
      });
    }
  };

  const updateNotes = async () => {
    try {
      setLoading(true);
      await api.put(`/tasks/${task._id}`, { notes });
      showSuccess("Notes updated");
    } catch (err) {
      showError("Failed to update notes");
    } finally {
      setLoading(false);
    }
  };

  const InfoBlock = ({ icon, label, value, className = "" }) => (
    <div className={`flex gap-3 ${className}`}>
      <div className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm text-gray-900">{value || "--"}</p>
      </div>
    </div>
  );

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
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${task.status === "Completed"
                  ? "bg-green-100 text-green-700"
                  : task.status === "In Progress"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                  }`}>
                  {task.status}
                </span>
                {task.priority && (
                  <span className={`text-xs px-2 py-1 rounded-full ${task.priority === "High"
                    ? "bg-red-100 text-red-700"
                    : task.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                    }`}>
                    {task.priority} Priority
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "details"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              Details
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Task Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Task Information
                </h3>
                {task.description && (
                  <p className="text-gray-600">{task.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <InfoBlock
                    icon={<Clock size={16} />}
                    label="Scheduled Time"
                    value={task.job?.time ? `${task.job.time}` : "Flexible"}
                  />
                  <InfoBlock
                    icon={<Calendar size={16} />}
                    label="Date"
                    value={task.job?.date}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Location
                </h3>
                <InfoBlock
                  icon={<MapPin size={16} />}
                  label="Address"
                  value={task.job?.address}
                  className="mb-2"
                />
                {task.job?.city && (
                  <p className="text-sm text-gray-600">{task.job.city}, {task.job.state}</p>
                )}
              </div>

              {/* Customer */}
              {task.job?.customerName && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Customer
                  </h3>
                  <div className="space-y-3">
                    <InfoBlock
                      icon={<User size={16} />}
                      label="Name"
                      value={task.job.customerName}
                    />
                    {task.job.phone && (
                      <InfoBlock
                        icon={<Phone size={16} />}
                        label="Phone"
                        value={task.job.phone}
                      />
                    )}
                    {task.job.email && (
                      <InfoBlock
                        icon={<Mail size={16} />}
                        label="Email"
                        value={task.job.email}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Assignment */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Assignment
                </h3>
                <InfoBlock
                  icon={<User size={16} />}
                  label="Assigned To"
                  value={task.assignedTo?.name || "Unassigned"}
                />
                {task.assignedTo?.phone && (
                  <InfoBlock
                    icon={<Phone size={16} />}
                    label="Cleaner Phone"
                    value={task.assignedTo.phone}
                  />
                )}
              </div>

              {/* Job Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Job Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {task.job?.workType && (
                    <InfoBlock
                      icon={<FileText size={16} />}
                      label="Work Type"
                      value={task.job.workType}
                    />
                  )}
                  {task.job?.areas && (
                    <InfoBlock
                      icon={<FileText size={16} />}
                      label="Areas"
                      value={task.job.areas}
                    />
                  )}
                  {task.job?.price && (
                    <InfoBlock
                      icon={<DollarSign size={16} />}
                      label="Price"
                      value={`$${parseFloat(task.job.price).toLocaleString()}`}
                    />
                  )}
                  {task.estTime && (
                    <InfoBlock
                      icon={<Clock size={16} />}
                      label="Estimated Time"
                      value={`${task.estTime} hours`}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="6"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  placeholder="Add notes about this task..."
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={updateNotes}
                    disabled={loading || notes === task.notes}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Save Notes"}
                  </button>
                </div>
              </div>

              {task.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Activity History
              </h3>
              <div className="text-center py-8 text-gray-500">
                No activity history available
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 space-y-3">
          {/* Status Actions */}
          <div className="grid grid-cols-2 gap-3">
            {task.status !== "Completed" && task.status !== "In Progress" && (
              <button
                onClick={() => updateStatus("In Progress")}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Start Task
              </button>
            )}

            {task.status === "In Progress" && (
              <button
                onClick={() => updateStatus("Completed")}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Mark Complete
              </button>
            )}

            {task.status !== "Cancelled" && (
              <button
                onClick={() => updateStatus("Cancelled")}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel Task
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}