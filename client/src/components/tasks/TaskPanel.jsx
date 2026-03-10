// TaskPanel.jsx - Main Component
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  Loader2,
  CalendarDays,
  Grid3x3,
  List,
  MapPin,
  User,
} from "lucide-react";
import api from "../../api/axios";
import TaskTimelineItem from "./TaskTimelineItem";
import TaskDrawer from "./TaskDrawer";
import ConfirmationModal from "../common/ConfirmationModal";
import TaskStats from "./TaskStats";
import { showError, showSuccess } from "../../utils/toast";

export default function TaskPanel() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [viewMode, setViewMode] = useState("timeline"); // 'timeline' | 'grid' | 'list'
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");


  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger",
    isLoading: false
  });

  const [showFilters, setShowFilters] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tasks?date=${date}`);
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showError("Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (statusFilter !== "all") {
      result = result.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter(task => task.priority === priorityFilter);
    }

    // Sort by time
    return result.sort((a, b) => {
      const timeA = a.job?.time || "00:00";
      const timeB = b.job?.time || "00:00";
      return timeA.localeCompare(timeB);
    });
  }, [tasks, statusFilter, priorityFilter]);

  const navigateDate = (direction) => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + direction);
    setDate(currentDate.toISOString().split("T")[0]);
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      showSuccess("Task updated successfully");
      fetchTasks();
    } catch (err) {
      showError("Failed to update task");
    }
  };

  const handleUpdateStatus = (taskId, newStatus, onSuccess) => {
    setConfirmModal({
      isOpen: true,
      title: "Update Task Status",
      message: `Are you sure you want to change the status to ${newStatus}?`,
      type: "info",
      confirmText: "Update",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        await updateTaskStatus(taskId, newStatus);
        setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, type: "danger", isLoading: false });
        if (onSuccess) onSuccess();
      }
    });
  };
  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-surface-0 p-4 md:p-6 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-ink-primary">Task Timeline</h1>
              <p className="text-sm md:text-base text-ink-muted mt-1 md:mt-2">Manage and monitor daily cleaning jobs</p>
            </div>
          </div>

          {/* Stats Overview */}
          <TaskStats tasks={tasks} />
        </div>

        {/* Date Navigation & Controls */}
        <div className="bg-surface-0 rounded-2xl shadow-sm border border-surface-3 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateDate(-1)}
                className="p-2 hover:bg-surface-2 rounded-xl transition-all"
              >
                <ChevronLeft size={20} className="text-ink-secondary" />
              </button>

              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-brand-600" />
                <span className="font-bold text-ink-primary">
                  {formatDateDisplay(date)}
                </span>
              </div>

              <button
                onClick={() => navigateDate(1)}
                className="p-2 hover:bg-surface-2 rounded-xl transition-all"
              >
                <ChevronRight size={20} className="text-ink-secondary" />
              </button>

              <button
                onClick={() => setDate(new Date().toISOString().split("T")[0])}
                className="text-xs font-bold uppercase tracking-wider text-ink-secondary hover:text-ink-primary px-3 py-1.5 hover:bg-surface-2 rounded-xl transition-all"
              >
                Today
              </button>
            </div>

            {/* View Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center border border-surface-3 rounded-xl overflow-hidden bg-surface-1">
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`p-2 ${viewMode === "timeline" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <Clock size={18} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <List size={18} />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 border border-surface-3 bg-surface-1 text-ink-secondary px-4 py-2 rounded-xl hover:bg-surface-2 transition-all text-sm font-semibold"
              >
                <Filter size={16} />
                Filters
                {(statusFilter !== "all" || priorityFilter !== "all") && (
                  <span className="bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {[statusFilter, priorityFilter].filter(f => f !== "all").length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-surface-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-2 block">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-premium"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-2 block">
                    Priority
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="input-premium"
                  >
                    <option value="all">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timeline View */}
        {viewMode === "timeline" && (
          <div className="bg-surface-0 rounded-2xl shadow-sm border border-surface-3 overflow-hidden">
            {/* Timeline Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  Daily Schedule
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({filteredTasks.length} tasks)
                  </span>
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span>Pending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 size={40} className="text-gray-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading tasks...</p>
                  </div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-16">
                  <CalendarDays className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tasks scheduled
                  </h3>
                  <p className="text-gray-600">
                    {statusFilter !== "all" || priorityFilter !== "all"
                      ? "Try adjusting your filters"
                      : `No tasks scheduled for ${formatDateDisplay(date)}`
                    }
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-24 top-0 bottom-0 w-0.5 bg-gray-200" />

                  <div className="space-y-6">
                    {filteredTasks.map((task, index) => (
                      <TaskTimelineItem
                        key={task._id || index}
                        task={task}
                        onClick={() => setActiveTask(task)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                onClick={() => setActiveTask(task)}
                className="bg-surface-0 border border-surface-3 rounded-2xl p-4 hover:border-brand-500/30 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0 pr-3">
                    <h3 className="font-bold text-ink-primary truncate group-hover:text-brand-600 transition-colors">{task.title}</h3>
                    <p className="text-[11px] font-medium text-ink-muted uppercase tracking-wider mt-1">
                      {task.job?.time || "All day"}
                    </p>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shrink-0 ${task.status === "Completed"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200/50"
                    : task.status === "In Progress"
                      ? "bg-brand-50 text-brand-700 border border-brand-200/50"
                      : "bg-amber-100 text-amber-800 border border-amber-200/50"
                    }`}>
                    {task.status}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5 text-ink-secondary bg-surface-1 py-1.5 px-3 rounded-lg border border-surface-3">
                    <MapPin size={14} className="shrink-0 text-brand-500" />
                    <span className="truncate">{task.job?.address || "No address"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-ink-secondary bg-surface-1 py-1.5 px-3 rounded-lg border border-surface-3">
                    <User size={14} className="shrink-0 text-brand-500" />
                    <span className="truncate">{task.assignedTo?.name || "Unassigned"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="bg-surface-0 rounded-2xl shadow-sm border border-surface-3 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-surface-3 bg-surface-1">
                    <th className="px-6 py-4 text-[10px] font-bold text-ink-muted uppercase tracking-wider">Task</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-ink-muted uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-ink-muted uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-ink-muted uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-ink-muted uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-ink-muted uppercase tracking-wider">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-3">
                  {filteredTasks.map((task) => (
                    <tr
                      key={task._id}
                      onClick={() => setActiveTask(task)}
                      className="table-row-hover cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="min-w-[150px]">
                          <p className="font-bold text-ink-primary">{task.title}</p>
                          <p className="text-xs text-ink-muted truncate max-w-xs mt-0.5">
                            {task.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-ink-secondary">{task.job?.time || "--"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <MapPin size={14} className="text-brand-500 shrink-0" />
                          <span className="text-sm font-medium text-ink-secondary truncate">{task.job?.address || "--"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <User size={14} className="text-brand-500 shrink-0" />
                          <span className="text-sm font-medium text-ink-secondary truncate">{task.assignedTo?.name || "--"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${task.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200/50"
                          : task.status === "In Progress"
                            ? "bg-brand-50 text-brand-700 border border-brand-200/50"
                            : "bg-amber-100 text-amber-800 border border-amber-200/50"
                          }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${task.priority === "High"
                          ? "bg-rose-100 text-rose-800 border border-rose-200/50"
                          : task.priority === "Medium"
                            ? "bg-amber-100 text-amber-800 border border-amber-200/50"
                            : "bg-blue-100 text-blue-800 border border-blue-200/50"
                          }`}>
                          {task.priority || "Medium"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Task Drawer */}
      {activeTask && (
        <TaskDrawer
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onRefresh={fetchTasks}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
}