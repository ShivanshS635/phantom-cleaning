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
      className="flex flex-col sm:flex-row gap-3 sm:gap-6 cursor-pointer group"
    >
      {/* Time & Duration Mobile-First Stack */}
      <div className="flex sm:flex-col justify-between sm:justify-start items-center sm:items-end sm:w-24 shrink-0 pl-4 sm:pl-0 border-l-2 sm:border-l-0 border-surface-3/50 sm:text-right relative">
        <div className="text-xs sm:text-sm font-bold text-ink-primary sm:pt-3 flex items-center gap-2">
          {/* Timeline Dot (Mobile inline vs Desktop absolute) */}
          <div className="sm:hidden w-2 h-2 rounded-full border border-white" style={{ backgroundColor: config.iconColor?.split('-')[1] ? `var(--tw-color-${config.iconColor.split('-')[1]}-500)` : 'currentColor' }} />
          <span>{formatTime(task.job?.time)}</span>
        </div>
        {task.duration && (
          <div className="text-[10px] sm:text-xs font-semibold text-ink-muted sm:mt-1 uppercase tracking-wider">
            {task.duration} hrs
          </div>
        )}
      </div>

      {/* Desktop Timeline Dot */}
      <div className="hidden sm:block relative flex-shrink-0">
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
          <div className={`w-4 h-4 rounded-full border-2 border-surface-0 shadow-sm`} style={{ backgroundColor: config.iconColor?.split('-')[1] ? `var(--tw-color-${config.iconColor.split('-')[1]}-500)` : 'currentColor' }} />
        </div>
      </div>

      {/* Task Card */}
      <div className="flex-1 sm:pb-6">
        <div className="bg-surface-0 border border-surface-3 rounded-2xl p-4 sm:p-5 hover:shadow-lg hover:border-brand-500/30 transition-all duration-200 group">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon size={16} className={config.iconColor} />
                <h3 className="font-bold text-ink-primary sm:text-lg truncate group-hover:text-brand-600 transition-colors">
                  {task.title || "Untitled Task"}
                </h3>
              </div>

              {task.description && (
                <p className="text-xs sm:text-sm text-ink-secondary mb-4 line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 sm:gap-4 text-xs">
                {task.job?.address && (
                  <div className="flex items-center gap-1.5 text-ink-secondary bg-surface-1 py-1 px-2.5 rounded-lg border border-surface-3">
                    <MapPin size={12} className="text-brand-500 shrink-0" />
                    <span className="truncate max-w-[150px] sm:max-w-xs">{task.job.address}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-ink-secondary bg-surface-1 py-1 px-2.5 rounded-lg border border-surface-3">
                  <User size={12} className="text-brand-500 shrink-0" />
                  <span className="truncate">{task.assignedTo?.name || "Unassigned"}</span>
                </div>

                {task.priority && (
                  <div className={`flex items-center text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${priorityConfig[task.priority] || priorityConfig.Medium}`}>
                    {task.priority} Priority
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto mt-2 sm:mt-0 sm:ml-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-surface-3">
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${config.pill}`}>
                {task.status}
              </span>
              <ChevronRight size={16} className="hidden sm:block text-ink-disabled group-hover:text-ink-secondary transition-colors mt-2" />
            </div>
          </div>

          {/* Task Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-surface-3 gap-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
              {task.job?.customerName && (
                <span className="bg-surface-1 px-2 py-0.5 rounded-md border border-surface-2 truncate float-left">Cust: {task.job.customerName}</span>
              )}
              {task.job?.phone && (
                <span className="bg-surface-1 px-2 py-0.5 rounded-md border border-surface-2 truncate">Ph: {task.job.phone}</span>
              )}
            </div>

            {task.estTime && (
              <div className="text-[11px] font-bold text-ink-primary uppercase tracking-wider">
                Est: <span className="text-brand-600">{task.estTime} hr</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}