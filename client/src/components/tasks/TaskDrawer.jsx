import { X, Clock, MapPin, User, AlertCircle } from "lucide-react";

export default function TaskDrawer({ task, onClose }) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[460px] bg-white shadow-2xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Job Details</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm">
          <div>
            <p className="text-lg font-medium">
              {task.title}
            </p>
            <p className="text-gray-500 mt-1">
              {task.description || "No description provided"}
            </p>
          </div>

          <InfoBlock
            icon={<MapPin size={16} />}
            label="Address"
            value={task.job?.address}
          />

          <InfoBlock
            icon={<Clock size={16} />}
            label="Scheduled Time"
            value={task.job?.time}
          />

          <InfoBlock
            icon={<User size={16} />}
            label="Assigned Cleaner"
            value={task.assignedTo?.name || "Unassigned"}
          />

          <InfoBlock
            icon={<AlertCircle size={16} />}
            label="Priority"
            value={task.priority || "--"}
          />

          <div>
            <p className="text-xs text-gray-400 mb-1">Current Status</p>
            <span
              className={`inline-block text-xs px-3 py-1 rounded-full
                ${
                  task.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : task.status === "In Progress"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
            >
              {task.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ icon, label, value }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-700">{value || "--"}</p>
      </div>
    </div>
  );
}
