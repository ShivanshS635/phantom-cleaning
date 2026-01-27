import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import TaskTimelineItem from "./TaskTimelineItem";
import TaskDrawer from "./TaskDrawer";

export default function TaskPanel() {
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tasks?date=${date}`);
      setTasks(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Daily Job Timeline</h1>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[92px] top-0 bottom-0 w-px bg-gray-200" />

        {loading && (
          <p className="text-center py-10 text-gray-500">
            Loading jobs...
          </p>
        )}

        {!loading && tasks.length === 0 && (
          <p className="text-center py-10 text-gray-500">
            No jobs scheduled for this date
          </p>
        )}

        <div className="space-y-8">
          {tasks.map((task) => (
            <TaskTimelineItem
              key={task._id}
              task={task}
              onClick={() => setActiveTask(task)}
            />
          ))}
        </div>
      </div>

      {/* Side Drawer */}
      <TaskDrawer
        task={activeTask}
        onClose={() => setActiveTask(null)}
      />
    </div>
  );
}
