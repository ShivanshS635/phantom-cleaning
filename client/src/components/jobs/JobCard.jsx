// JobCard.jsx
import { MapPin, Clock, User, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function JobCard({ job, onClick, onRefresh }) {
  const statusConfig = {
    Upcoming: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: Clock,
      iconColor: "text-blue-600"
    },
    Completed: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCircle,
      iconColor: "text-emerald-600"
    },
    Redo: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      icon: RefreshCw,
      iconColor: "text-orange-600"
    },
    Cancelled: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: XCircle,
      iconColor: "text-red-600"
    }
  };

  const config = statusConfig[job.status] || statusConfig.Upcoming;
  const StatusIcon = config.icon;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
            {job.customerName}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={14} className="text-gray-400" />
            <p className="text-sm text-gray-600 truncate">{job.address}</p>
          </div>
        </div>
        
        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${config.bg} ${config.border} ${config.text}`}>
          <StatusIcon size={12} className={config.iconColor} />
          <span className="text-xs font-medium">{job.status}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-400" />
            <span className="text-sm text-gray-700 font-medium">
              {formatDate(job.date)}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {job.time || "Anytime"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            <span className="text-sm text-gray-700">
              {job.assignedEmployee?.name || "Unassigned"}
            </span>
          </div>
          {job.price && (
            <span className="text-sm font-semibold text-gray-900">
              ${parseFloat(job.price).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {job.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">{job.notes}</p>
        </div>
      )}
    </div>
  );
}