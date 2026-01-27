import TaskCard from "./TaskCard";

export default function ManagerTaskView({ tasks }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Task Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map(task => (
          <TaskCard key={task._id} task={task} role="MANAGER" />
        ))}
      </div>
    </div>
  );
}