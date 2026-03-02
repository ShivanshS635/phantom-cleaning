import { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  Filter,
  MapPin,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Briefcase,
} from "lucide-react";
import api from "../../api/axios";
import JobCard from "./JobCard";
import JobDrawer from "./JobDrawer";
import JobFormDrawer from "./JobFormDrawer";
import JobsCalendar from "./JobsCalender";
import StatsOverview from "./StatsOverview";
import { showError, showSuccess } from "../../utils/toast";
import ConfirmationModal from "../common/ConfirmationModal";

const STATUSES = ["All", "Upcoming", "Completed", "Redo", "Cancelled"];
const AU_STATES = ["All", "Sydney", "Melbourne", "Brisbane", "Adelaide", "Perth"];

export default function JobsPanel() {
  const [viewMode, setViewMode] = useState("list");
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: "", message: "", onConfirm: null, type: "danger", isLoading: false,
  });
  const [showAddJob, setShowAddJob] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({ today: true, upcoming: true, past: true });

  const handleStatusChange = (id, newStatus, onSuccess) => {
    setConfirmModal({
      isOpen: true,
      title: "Update Job Status",
      message: `Change status to "${newStatus}"?`,
      type: "info",
      confirmText: "Update",
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, isLoading: true }));
        try {
          await api.patch(`/jobs/${id}/status`, { status: newStatus });
          showSuccess("Status updated");
          fetchJobs();
          if (onSuccess) onSuccess();
        } catch {
          showError("Failed to update status");
        } finally {
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, type: "danger", isLoading: false });
        }
      },
    });
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/jobs");
      setJobs(res.data.data || []);
    } catch {
      showError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const filteredJobs = useMemo(() => {
    let r = jobs;
    if (statusFilter !== "All") r = r.filter(j => j.status === statusFilter);
    if (stateFilter !== "All") r = r.filter(j => j.state === stateFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter(j =>
        j.customerName?.toLowerCase().includes(q) ||
        j.address?.toLowerCase().includes(q) ||
        j.phone?.includes(q)
      );
    }
    return r;
  }, [jobs, statusFilter, stateFilter, searchQuery]);

  const groupedJobs = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const groups = { today: [], upcoming: [], past: [] };
    filteredJobs.forEach(job => {
      const d = job.date;
      if (d === today) groups.today.push(job);
      else if (d > today) groups.upcoming.push(job);
      else groups.past.push(job);
    });
    Object.values(groups).forEach(g =>
      g.sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""))
    );
    return groups;
  }, [filteredJobs]);

  const toggleSection = (s) => setExpandedSections(p => ({ ...p, [s]: !p[s] }));

  // Stat pills
  const statPills = [
    { label: "Total", count: jobs.length, color: "bg-surface-2 text-ink-primary" },
    { label: "Today", count: groupedJobs.today.length, color: "bg-brand-50 text-brand-700" },
    { label: "Upcoming", count: groupedJobs.upcoming.length, color: "bg-blue-50 text-blue-700" },
    { label: "Completed", count: jobs.filter(j => j.status === "Completed").length, color: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="min-h-screen bg-surface-1">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600/10 flex items-center justify-center">
              <Briefcase size={18} className="text-brand-600" />
            </div>
            {/* Stat pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {statPills.map(({ label, count, color }) => (
                <span key={label} className={`badge font-semibold ${color}`}>
                  {count} {label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setViewMode(v => v === "list" ? "calendar" : "list")}
              className="btn-secondary text-sm"
            >
              {viewMode === "list" ? (
                <><CalendarIcon size={15} /> Calendar</>
              ) : (
                <><Briefcase size={15} /> List View</>
              )}
            </button>
            <button
              onClick={() => setShowAddJob(true)}
              className="btn-primary text-sm"
            >
              <Plus size={15} />
              Add Job
            </button>
          </div>
        </div>

        {/* ── Stats Overview ── */}
        <StatsOverview jobs={jobs} />

        {/* ── Filter Bar ── */}
        <div className="card p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Search by customer, address, or phone…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-premium pl-9 py-2.5 text-sm"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="input-premium pl-8 pr-10 py-2.5 text-sm w-40 appearance-none"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
              </select>
            </div>

            {/* State filter */}
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <select
                value={stateFilter}
                onChange={e => setStateFilter(e.target.value)}
                className="input-premium pl-8 pr-10 py-2.5 text-sm w-36 appearance-none"
              >
                {AU_STATES.map(s => <option key={s} value={s}>{s === "All" ? "All States" : s}</option>)}
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchJobs}
              disabled={loading}
              className="btn-secondary text-sm px-3"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-9 h-9 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-3 w-24" />
                  </div>
                </div>
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : viewMode === "calendar" ? (
          <JobsCalendar jobs={filteredJobs} onRefresh={fetchJobs} />
        ) : (
          <div className="space-y-5">
            {groupedJobs.today.length > 0 && (
              <JobSection
                title="Today's Jobs" emoji="🔥"
                jobs={groupedJobs.today}
                isExpanded={expandedSections.today}
                onToggle={() => toggleSection("today")}
                onSelectJob={setSelectedJob}
                onRefresh={fetchJobs}
                accentClass="border-amber-400 bg-amber-50 text-amber-700"
              />
            )}
            {groupedJobs.upcoming.length > 0 && (
              <JobSection
                title="Upcoming" emoji="📅"
                jobs={groupedJobs.upcoming}
                isExpanded={expandedSections.upcoming}
                onToggle={() => toggleSection("upcoming")}
                onSelectJob={setSelectedJob}
                onRefresh={fetchJobs}
                accentClass="border-blue-400 bg-blue-50 text-blue-700"
              />
            )}
            {groupedJobs.past.length > 0 && (
              <JobSection
                title="Past Jobs" emoji="📋"
                jobs={groupedJobs.past}
                isExpanded={expandedSections.past}
                onToggle={() => toggleSection("past")}
                onSelectJob={setSelectedJob}
                onRefresh={fetchJobs}
                accentClass="border-surface-3 bg-surface-2 text-ink-secondary"
              />
            )}

            {filteredJobs.length === 0 && (
              <div className="card p-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={24} className="text-ink-muted" />
                </div>
                <h3 className="text-base font-semibold text-ink-primary mb-1">No jobs found</h3>
                <p className="text-sm text-ink-muted mb-6">
                  {searchQuery || statusFilter !== "All"
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first job"}
                </p>
                {!showAddJob && (
                  <button onClick={() => setShowAddJob(true)} className="btn-primary mx-auto">
                    <Plus size={16} /> Create First Job
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawers / Modals */}
      {selectedJob && (
        <JobDrawer
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onRefresh={fetchJobs}
          onUpdateStatus={handleStatusChange}
        />
      )}
      {showAddJob && (
        <JobFormDrawer
          onClose={() => setShowAddJob(false)}
          onSuccess={() => { setShowAddJob(false); fetchJobs(); }}
        />
      )}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
}

function JobSection({ title, emoji, jobs, isExpanded, onToggle, onSelectJob, onRefresh, accentClass }) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-surface-1 transition-colors border-b border-surface-3"
      >
        <div className="flex items-center gap-3">
          <span className="text-base">{emoji}</span>
          <h2 className="text-sm font-semibold text-ink-primary">{title}</h2>
          <span className={`badge border ${accentClass}`}>
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
          </span>
        </div>
        {isExpanded
          ? <ChevronUp size={16} className="text-ink-muted" />
          : <ChevronDown size={16} className="text-ink-muted" />}
      </button>

      {isExpanded && (
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {jobs.map(job => (
              <JobCard
                key={job._id}
                job={job}
                onClick={() => onSelectJob(job)}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}