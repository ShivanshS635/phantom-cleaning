import TaskCard from "./TaskCard";

export default function CleanerTaskView({ tasks }) {
  const todayTasks = tasks.filter(
    t => t.status !== "COMPLETED"
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Tasks</h1>

      <div className="grid gap-4">
        {todayTasks.map(task => (
          <TaskCard key={task._id} task={task} role="CLEANER" />
        ))}
      </div>
    </div>
  );
}