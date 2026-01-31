// TaskTimelineItem.jsx
import { MapPin, User, Clock, AlertCircle, ChevronRight, CheckCircle2, PlayCircle } from "lucide-react";

export default function TaskTimelineItem({ task, onClick }) {
  if (!task) return null;

  const statusConfig = {
    Completed: {
      dot: "bg-green-500",
      pill: "bg-green-100 text-green-700",
      icon: CheckCircle2,
      iconColor: "text-green-500"
    },
    "In Progress": {
      dot: "bg-blue-500",
      pill: "bg-blue-100 text-blue-700",
      icon: PlayCircle,
      iconColor: "text-blue-500"
    },
    Pending: {
      dot: "bg-yellow-500",
      pill: "bg-yellow-100 text-yellow-700",
      icon: Clock,
      iconColor: "text-yellow-500"
    },
    Cancelled: {
      dot: "bg-red-500",
      pill: "bg-red-100 text-red-700",
      icon: AlertCircle,
      iconColor: "text-red-500"
    }
  };

  const priorityConfig = {
    High: "text-red-600 bg-red-50 border-red-200",
    Medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    Low: "text-blue-600 bg-blue-50 border-blue-200"
  };

  const config = statusConfig[task.status] || statusConfig.Pending;
  const StatusIcon = config.icon;

  const formatTime = (timeStr) => {
    if (!timeStr) return "All day";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div
      onClick={onClick}
      className="flex gap-6 cursor-pointer group"
    >
      {/* Time Column */}
      <div className="w-24 text-right">
        <div className="text-sm font-medium text-gray-900 pt-3">
          {formatTime(task.job?.time)}
        </div>
        {task.duration && (
          <div className="text-xs text-gray-500 mt-1">
            {task.duration} hours
          </div>
        )}
      </div>

      {/* Timeline Dot */}
      <div className="relative flex-shrink-0">
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
          <div className={`w-4 h-4 rounded-full border-2 border-white ${config.dot} shadow-sm`} />
        </div>
      </div>

      {/* Task Card */}
      <div className="flex-1 pb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm group-hover:shadow-md group-hover:border-gray-300 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon size={16} className={config.iconColor} />
                <h3 className="font-semibold text-gray-900 text-lg">
                  {task.title || "Untitled Task"}
                </h3>
              </div>

              {task.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {task.job?.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="truncate max-w-xs">{task.job.address}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1.5">
                  <User size={14} className="text-gray-400" />
                  <span>{task.assignedTo?.name || "Unassigned"}</span>
                </div>

                {task.priority && (
                  <div className={`text-xs px-2 py-1 rounded-full border ${priorityConfig[task.priority] || priorityConfig.Medium}`}>
                    {task.priority} Priority
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 ml-4">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${config.pill}`}>
                {task.status}
              </span>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </div>

          {/* Task Metadata */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {task.job?.customerName && (
                <span>Customer: {task.job.customerName}</span>
              )}
              {task.job?.phone && (
                <span>Phone: {task.job.phone}</span>
              )}
            </div>
            
            {task.estTime && (
              <div className="text-xs text-gray-500">
                Est. {task.estTime} hours
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}