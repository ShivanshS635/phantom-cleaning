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
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  Plus
} from "lucide-react";
import api from "../../api/axios";
import TaskTimelineItem from "./TaskTimelineItem";
import TaskDrawer from "./TaskDrawer";
import TaskStats from "./TaskStats";
import { showError } from "../../utils/toast";

export default function TaskPanel() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [viewMode, setViewMode] = useState("timeline"); // 'timeline' | 'grid' | 'list'
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Timeline</h1>
              <p className="text-gray-600 mt-2">Manage and monitor daily cleaning jobs</p>
            </div>
          </div>

          {/* Stats Overview */}
          <TaskStats tasks={tasks} />
        </div>

        {/* Date Navigation & Controls */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateDate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-gray-400" />
                <span className="font-semibold text-gray-900">
                  {formatDateDisplay(date)}
                </span>
              </div>
              
              <button
                onClick={() => navigateDate(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
              
              <button
                onClick={() => setDate(new Date().toISOString().split("T")[0])}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Today
              </button>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
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
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
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
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                onClick={() => setActiveTask(task)}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {task.job?.time || "All day"}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === "Completed" 
                      ? "bg-green-100 text-green-700"
                      : task.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {task.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={14} />
                    <span className="truncate">{task.job?.address || "No address"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={14} />
                    <span>{task.assignedTo?.name || "Unassigned"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">Task</th>
                  <th className="text-left p-4 font-medium text-gray-900">Time</th>
                  <th className="text-left p-4 font-medium text-gray-900">Location</th>
                  <th className="text-left p-4 font-medium text-gray-900">Assigned To</th>
                  <th className="text-left p-4 font-medium text-gray-900">Status</th>
                  <th className="text-left p-4 font-medium text-gray-900">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr
                    key={task._id}
                    onClick={() => setActiveTask(task)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {task.description}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">{task.job?.time || "--"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-gray-700">{task.job?.address || "--"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-gray-700">{task.assignedTo?.name || "--"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block text-xs px-3 py-1 rounded-full ${
                        task.status === "Completed" 
                          ? "bg-green-100 text-green-700"
                          : task.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block text-xs px-3 py-1 rounded-full ${
                        task.priority === "High" 
                          ? "bg-red-100 text-red-700"
                          : task.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {task.priority || "Medium"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Drawer */}
      {activeTask && (
        <TaskDrawer
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onRefresh={fetchTasks}
        />
      )}
    </div>
  );
}