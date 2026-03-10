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
      <div className="text-brand-500 mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-ink-muted font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-medium text-ink-primary">{value || "--"}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-primary/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-surface-0 shadow-float flex flex-col animate-in slide-in-from-right-full duration-300">
        {/* Header */}
        <div className="border-b border-surface-3 bg-surface-1 p-5 sm:p-6 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${task.status === "Completed"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200/50"
                  : task.status === "In Progress"
                    ? "bg-brand-50 text-brand-700 border border-brand-200/50"
                    : "bg-amber-100 text-amber-800 border border-amber-200/50"
                  }`}>
                  {task.status}
                </span>
                {task.priority && (
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${task.priority === "High"
                    ? "bg-rose-100 text-rose-800 border border-rose-200/50"
                    : task.priority === "Medium"
                      ? "bg-amber-100 text-amber-800 border border-amber-200/50"
                      : "bg-blue-100 text-blue-800 border border-blue-200/50"
                    }`}>
                    {task.priority}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-ink-primary">{task.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-2 rounded-xl transition-all"
            >
              <X size={20} className="text-ink-muted" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 text-[11px] uppercase tracking-wider font-bold rounded-xl transition-all ${activeTab === "details"
                ? "bg-ink-primary text-surface-0 shadow-md"
                : "text-ink-secondary hover:bg-surface-2"
                }`}
            >
              Details
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 pb-24">
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Task Info */}
              <div className="space-y-3 bg-surface-1 p-4 rounded-xl border border-surface-3">
                <h3 className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest">
                  Task Information
                </h3>
                {task.description && (
                  <p className="text-sm text-ink-primary font-medium">{task.description}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
              <div className="space-y-3 bg-surface-1 p-4 rounded-xl border border-surface-3">
                <h3 className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest">
                  Location
                </h3>
                <InfoBlock
                  icon={<MapPin size={16} />}
                  label="Address"
                  value={task.job?.address}
                  className="mb-1"
                />
                {task.job?.city && (
                  <p className="text-sm font-medium text-ink-primary ml-10">{task.job.city}, {task.job.state}</p>
                )}
              </div>

              {/* Customer */}
              {task.job?.customerName && (
                <div className="space-y-3 bg-surface-1 p-4 rounded-xl border border-surface-3">
                  <h3 className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest">
                    Customer
                  </h3>
                  <div className="space-y-4">
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
              <div className="space-y-3 bg-surface-1 p-4 rounded-xl border border-surface-3">
                <h3 className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest">
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
              <div className="space-y-3 bg-surface-1 p-4 rounded-xl border border-surface-3">
                <h3 className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest">
                  Job Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-2 block">
                  Task Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="6"
                  className="input-premium resize-none"
                  placeholder="Add notes about this task..."
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={updateNotes}
                    disabled={loading || notes === task.notes}
                    className="btn-primary py-2 px-5 shadow-brand text-sm"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Save Notes"}
                  </button>
                </div>
              </div>

              {task.notes && (
                <div>
                  <h4 className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-2">Existing Notes</h4>
                  <div className="bg-surface-1 rounded-xl p-4 border border-surface-3">
                    <p className="text-sm font-medium text-ink-primary whitespace-pre-wrap">{task.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest">
                Activity History
              </h3>
              <div className="text-center py-12 text-ink-muted text-sm font-medium">
                No activity history available
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-surface-3 bg-surface-1 p-5 sm:p-6 shrink-0 absolute bottom-0 w-full rounded-b-lg sm:rounded-none">
          {/* Status Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {task.status !== "Completed" && task.status !== "In Progress" && (
              <button
                onClick={() => updateStatus("In Progress")}
                disabled={loading}
                className="btn-primary py-2.5 sm:col-span-1"
              >
                Start Task
              </button>
            )}

            {task.status === "In Progress" && (
              <button
                onClick={() => updateStatus("Completed")}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md sm:col-span-1"
              >
                Mark Complete
              </button>
            )}

            {task.status !== "Cancelled" && (
              <button
                onClick={() => updateStatus("Cancelled")}
                disabled={loading}
                className="btn-danger py-2.5 sm:col-span-1"
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