import { useState, Suspense, lazy } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Receipt,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Coins,
} from "lucide-react";
import JobsPanel from "../jobs/JobsPanel";
import EmployeesPanel from "../employees/EmployeesPanel";
import DashboardWrapper from "../dashboard/DashboardWrapper";
import TaskPanel from "../tasks/TaskPanel";
import AdminExpenses from "../expenses/AdminExpenses";
const PayrollPanel = lazy(() => import("../payroll/PayrollPanel"));

const SALARY_ENABLED = process.env.REACT_APP_SALARY_MODULE_ENABLED === "true";


const NAV_ITEMS = [
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "employees", label: "Employees", icon: Users },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "payroll", label: "Payroll", icon: Coins },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const PAGE_TITLES = {
  tasks: { title: "Tasks", subtitle: "Manage and track team tasks" },
  jobs: { title: "Job Management", subtitle: "Schedule and monitor cleaning jobs" },
  employees: { title: "Team Members", subtitle: "Manage your staff and roles" },
  expenses: { title: "Expense Management", subtitle: "Track and control business spending" },
  payroll: { title: "Payroll Management", subtitle: "Manage employee salaries and payments" },
  dashboard: { title: "Analytics Dashboard", subtitle: "Business performance overview" },
};

function getInitials(str = "") {
  return str.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "PA";
}

function getUserName() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "Admin";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.name || payload.email || "Admin";
  } catch {
    return "Admin";
  }
}

export default function MainLayout() {
  const [activePanel, setActivePanel] = useState("tasks");
  const [collapsed, setCollapsed] = useState(false);
  const userName = getUserName();

  const filteredNav = NAV_ITEMS.filter(item => item.id !== "payroll" || SALARY_ENABLED);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const { title, subtitle } = PAGE_TITLES[activePanel] || {};

  return (
    <div className="flex min-h-screen bg-surface-1 font-sans">
      {/* ── Sidebar ─────────────────────────────── */}
      <aside
        className={`
          sidebar-bg flex flex-col shrink-0
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[70px]" : "w-[240px]"}
          fixed top-0 left-0 h-screen z-30
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/8 ${collapsed ? "justify-center" : ""}`}>
          <div className="shrink-0 w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <p className="text-sm font-bold text-white leading-tight">Phantom</p>
              <p className="text-[10px] text-slate-400 leading-tight tracking-wide uppercase">Cleaning Admin</p>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-brand-600 border-2 border-surface-1 flex items-center justify-center hover:bg-brand-500 transition-colors z-50 shadow-float"
        >
          {collapsed
            ? <ChevronRight size={11} className="text-white" />
            : <ChevronLeft size={11} className="text-white" />}
        </button>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {filteredNav.map(({ id, label, icon: Icon }) => {
            const isActive = activePanel === id;
            return (
              <button
                key={id}
                onClick={() => setActivePanel(id)}
                title={collapsed ? label : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium transition-all duration-200 text-left
                  ${isActive
                    ? "bg-brand-600/20 text-white"
                    : "text-slate-400 hover:bg-white/6 hover:text-slate-200"}
                  ${collapsed ? "justify-center" : ""}
                `}
                style={isActive ? { boxShadow: "inset 3px 0 0 #6366f1" } : {}}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${isActive ? "text-brand-400" : "text-slate-500"}`}
                />
                {!collapsed && (
                  <span className="animate-fade-in whitespace-nowrap">{label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className={`p-3 border-t border-white/8 ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-xl text-slate-400 hover:bg-white/8 hover:text-white transition-colors"
            >
              <LogOut size={18} />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">{getInitials(userName)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-500 truncate">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-white/8 hover:text-slate-200 transition-colors"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "ml-[70px]" : "ml-[240px]"}`}
      >
        {/* Top bar */}
        <header className="h-16 sticky top-0 z-20 bg-surface-0/80 backdrop-blur-md border-b border-surface-3 flex items-center px-6 gap-4">
          <div className="flex-1">
            <h1 className="text-base font-semibold text-ink-primary leading-tight">{title}</h1>
            <p className="text-xs text-ink-muted leading-tight">{subtitle}</p>
          </div>
        </header>

        {/* Panel */}
        <main className="flex-1 p-6 overflow-auto">
          <div key={activePanel} className="panel-enter">
            {activePanel === "tasks" && <TaskPanel />}
            {activePanel === "jobs" && <JobsPanel />}
            {activePanel === "employees" && <EmployeesPanel />}
            {activePanel === "dashboard" && <DashboardWrapper />}
            {activePanel === "expenses" && <AdminExpenses />}
            {activePanel === "payroll" && SALARY_ENABLED && (
              <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <PayrollPanel />
                </div>
              </Suspense>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
