import { useState } from "react";
import JobsPanel from "../jobs/JobsPanel";
import EmployeesPanel from "../employees/EmployeesPanel";
import DashboardWrapper from "../dashboard/DashboardWrapper";
import TaskPanel from "../tasks/TaskPanel";
import AdminExpenses from "../expenses/AdminExpenses";

export default function MainLayout() {
  const [activePanel, setActivePanel] = useState("tasks");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-black text-white p-4">
        <h2 className="text-xl font-bold mb-6">Phantom Admin</h2>

        <SidebarButton label="Tasks" onClick={() => setActivePanel("tasks")} />
        <SidebarButton label="Jobs" onClick={() => setActivePanel("jobs")} />
        <SidebarButton label="Employees" onClick={() => setActivePanel("employees")} />
        <SidebarButton label="Dashboard 🔒" onClick={() => setActivePanel("dashboard")} />
        <SidebarButton
          label="Expenses 💸"
          onClick={() => setActivePanel("expenses")}
        />

      </aside>

      <main className="flex-1 p-6 bg-gray-100">
        {activePanel === "tasks" && <TaskPanel />}
        {activePanel === "jobs" && <JobsPanel />}
        {activePanel === "employees" && <EmployeesPanel />}
        {activePanel === "dashboard" && <DashboardWrapper />}
        {activePanel === "expenses" && <AdminExpenses />}
      </main>
    </div>
  );
}

function SidebarButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-left mb-2 hover:bg-white/10 p-2 rounded"
    >
      {label}
    </button>
  );
}
