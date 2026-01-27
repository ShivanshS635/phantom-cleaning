import { Clock, User } from "lucide-react";

export default function TaskCard({ task, onOpen }) {
  if (!task) return null;

  return (
    <div
      onClick={onOpen}
      className="p-5 cursor-pointer hover:bg-gray-50 transition"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">
            {task.title || "Untitled Job"}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            {task.job?.address || "No address"}
            {task.job?.city && `, ${task.job.city}`}
          </p>

          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {task.job?.time || "--"}
            </span>

            <span className="flex items-center gap-1">
              <User size={12} />
              {task.assignedTo?.name || "Unassigned"}
            </span>
          </div>
        </div>

        <span
          className={`text-xs px-3 py-1 rounded-full
            ${
              task.status === "Completed"
                ? "bg-green-100 text-green-700"
                : task.status === "In Progress"
                ? "bg-blue-100 text-blue-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
        >
          {task.status || "Pending"}
        </span>
      </div>
    </div>
  );
}
