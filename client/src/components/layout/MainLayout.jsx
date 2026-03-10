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
  Menu,
} from "lucide-react";
import JobsPanel from "../jobs/JobsPanel";
import EmployeesPanel from "../employees/EmployeesPanel";
import DashboardWrapper from "../dashboard/DashboardWrapper";
import TaskPanel from "../tasks/TaskPanel";
import AdminExpenses from "../expenses/AdminExpenses";
const PayrollPanel = lazy(() => import("../payroll/PayrollPanel"));

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userName = getUserName();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const { title } = PAGE_TITLES[activePanel] || {};

  return (
    <div className="flex min-h-screen bg-surface-1 font-sans relative">
      {/* ── Mobile Backdrop ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-ink-primary/50 backdrop-blur-sm z-30 md:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────── */}
      <aside
        className={`
          sidebar-bg flex flex-col shrink-0
          transition-all duration-300 ease-in-out
          fixed top-0 left-0 h-screen z-40
          ${collapsed ? "md:w-[70px]" : "md:w-[240px]"}
          ${mobileMenuOpen ? "translate-x-0 w-[240px]" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-5 h-16 border-b border-surface-3/10 ${collapsed ? "justify-center" : ""}`}>
          <div className="shrink-0 w-8 h-8 rounded-lg bg-surface-0/10 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <p className="text-sm font-bold text-white tracking-wide">Phantom</p>
            </div>
          )}
        </div>

        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden md:flex absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-brand-600 border-2 border-surface-1 items-center justify-center hover:bg-brand-500 transition-colors z-50 shadow-float"
        >
          {collapsed
            ? <ChevronRight size={11} className="text-white" />
            : <ChevronLeft size={11} className="text-white" />}
        </button>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activePanel === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActivePanel(id);
                  setMobileMenuOpen(false);
                }}
                title={collapsed ? label : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-all duration-200 text-left
                  ${isActive
                    ? "bg-surface-0/10 text-white shadow-sm"
                    : "text-zinc-400 hover:bg-surface-0/5 hover:text-zinc-200"}
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-zinc-500"}`}
                />
                {!collapsed && (
                  <span className="animate-fade-in whitespace-nowrap">{label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className={`p-4 border-t border-surface-3/10 ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg text-zinc-400 hover:bg-surface-0/10 hover:text-white transition-colors"
            >
              <LogOut size={18} />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm border border-surface-0/10">
                <span className="text-xs font-bold text-white tracking-wider">{getInitials(userName)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-zinc-400 truncate">Admin</p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg text-zinc-400 hover:bg-surface-0/10 hover:text-white transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full md:w-auto ${collapsed ? "md:ml-[70px]" : "md:ml-[240px]"}`}
      >
        {/* Top bar */}
        <header className="h-16 sticky top-0 z-20 bg-surface-0 border-b border-surface-3 flex items-center px-4 md:px-8 justify-between">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 -ml-2 text-ink-secondary hover:bg-surface-2 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-sm text-ink-muted hidden sm:flex">
              <span className="font-medium hover:text-ink-primary cursor-pointer transition-colors">Workspace</span>
              <ChevronRight size={14} />
              <span className="font-semibold text-ink-primary drop-shadow-sm">{title}</span>
            </div>

            {/* Mobile Title Fallback */}
            <h1 className="text-base font-semibold text-ink-primary sm:hidden">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-ink-primary leading-tight">{userName}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-2 border border-surface-3 flex items-center justify-center shrink-0 cursor-pointer hover:border-ink-muted transition-colors">
              <span className="text-xs font-bold text-ink-secondary tracking-wider">{getInitials(userName)}</span>
            </div>
          </div>
        </header>

        {/* Panel */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden relative">
          <div key={activePanel} className="panel-enter">
            {activePanel === "tasks" && <TaskPanel />}
            {activePanel === "jobs" && <JobsPanel />}
            {activePanel === "employees" && <EmployeesPanel />}
            {activePanel === "dashboard" && <DashboardWrapper />}
            {activePanel === "expenses" && <AdminExpenses />}
            {activePanel === "payroll" && (
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
