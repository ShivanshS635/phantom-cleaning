// JobCard.jsx — Premium card with left status accent
import { MapPin, Clock, User, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const STATUS_CONFIG = {
  Upcoming: {
    accent: "border-blue-400",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-400",
    icon: Clock,
  },
  Completed: {
    accent: "border-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-400",
    icon: CheckCircle,
  },
  Redo: {
    accent: "border-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    icon: RefreshCw,
  },
  Cancelled: {
    accent: "border-rose-400",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-400",
    icon: XCircle,
  },
};

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

const AVATAR_GRADIENTS = [
  "from-brand-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-purple-500 to-violet-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
];

function getAvatarGradient(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export default function JobCard({ job, onClick }) {
  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.Upcoming;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
  };

  const initials = getInitials(job.customerName);
  const gradient = getAvatarGradient(job.customerName);

  return (
    <div
      onClick={onClick}
      className={`
        bg-surface-0 rounded-2xl border border-surface-3 p-4
        hover:shadow-card-hover hover:-translate-y-0.5
        transition-all duration-200 cursor-pointer
        border-l-4 ${config.accent}
        group
      `}
    >
      {/* Top row: avatar + customer + status badge */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
          <span className="text-xs font-bold text-white">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-ink-primary group-hover:text-brand-600 transition-colors truncate">
            {job.customerName}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-ink-muted shrink-0" />
            <p className="text-xs text-ink-muted truncate">{job.address}</p>
          </div>
        </div>
        <span className={`badge border ${config.badge} shrink-0`}>
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          {job.status}
        </span>
      </div>

      {/* Middle: date/time + assignee */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-ink-muted" />
            <span className="text-xs font-medium text-ink-primary">{formatDate(job.date)}</span>
          </div>
          {job.time && (
            <span className="text-xs text-ink-muted">{job.time}</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <User size={12} className="text-ink-muted" />
            <span className="text-xs text-ink-secondary">
              {job.assignedEmployee?.name || "Unassigned"}
            </span>
          </div>
          {job.price && (
            <span className="text-sm font-bold text-ink-primary">
              ${parseFloat(job.price).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Notes */}
      {job.notes && (
        <div className="pt-2.5 border-t border-surface-3">
          <p className="text-xs text-ink-muted line-clamp-1">{job.notes}</p>
        </div>
      )}
    </div>
  );
}