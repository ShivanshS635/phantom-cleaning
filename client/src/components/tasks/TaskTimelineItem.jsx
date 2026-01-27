import { MapPin, User } from "lucide-react";

export default function TaskTimelineItem({ task, onClick }) {
  if (!task) return null;

  return (
    <div
      onClick={onClick}
      className="flex gap-6 cursor-pointer group"
    >
      {/* Time */}
      <div className="w-[80px] text-right text-sm text-gray-500 pt-2">
        {task.job?.time || "--"}
      </div>

      {/* Status Dot */}
      <div className="relative z-10 pt-2">
        <div
          className={`w-4 h-4 rounded-full
            ${
              task.status === "Completed"
                ? "bg-green-500"
                : task.status === "In Progress"
                ? "bg-blue-500"
                : "bg-yellow-500"
            }`}
        />
      </div>

      {/* Card */}
      <div className="flex-1 bg-white border rounded-xl p-5 shadow-sm group-hover:shadow-md transition">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">
              {task.title || "Untitled Job"}
            </h3>

            <div className="flex gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {task.job?.address || "No address"}
              </span>

              <span className="flex items-center gap-1">
                <User size={14} />
                {task.assignedTo?.name || "Unassigned"}
              </span>
            </div>
          </div>

          <StatusPill status={task.status} />
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    Completed: "bg-green-100 text-green-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span className={`text-xs px-3 py-1 rounded-full ${map[status]}`}>
      {status}
    </span>
  );
}
