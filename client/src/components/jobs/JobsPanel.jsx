import { useEffect, useMemo, useState } from "react";
import { 
  Calendar as CalendarIcon,
  Filter,
  Plus,
  Search,
  Clock,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import api from "../../api/axios";
import JobCard from "./JobCard";
import JobDrawer from "./JobDrawer";
import JobFormDrawer from "./JobFormDrawer";
import StatsOverview from "./StatsOverview";
import { showError } from "../../utils/toast";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAddJob, setShowAddJob] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    today: true,
    upcoming: true,
    past: true
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/jobs");
      setJobs(res.data.data || []);
    } catch (err) {
      showError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    let result = jobs;
    
    if (statusFilter !== "All") {
      result = result.filter(job => job.status === statusFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job => 
        job.customerName?.toLowerCase().includes(query) ||
        job.address?.toLowerCase().includes(query) ||
        job.phone?.includes(query)
      );
    }
    
    return result;
  }, [jobs, statusFilter, searchQuery]);

  const groupedJobs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const groups = { today: [], upcoming: [], past: [] };
    
    filteredJobs.forEach(job => {
      const jobDate = job.date;
      if (jobDate === today) {
        groups.today.push(job);
      } else if (jobDate > today) {
        groups.upcoming.push(job);
      } else {
        groups.past.push(job);
      }
    });
    
    // Sort by date and time
    Object.values(groups).forEach(group => {
      group.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare === 0) {
          return (a.time || "").localeCompare(b.time || "");
        }
        return dateCompare;
      });
    });
    
    return groups;
  }, [filteredJobs]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
              <p className="text-gray-600 mt-2">Manage and monitor all cleaning jobs</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddJob(true)}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus size={20} />
                Add New Job
              </button>
              <a
                href="/jobs/calendar"
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <CalendarIcon size={20} />
                Calendar View
              </a>
            </div>
          </div>

          <StatsOverview jobs={jobs} />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search jobs by customer name, address, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="lg:col-span-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Redo">Redo</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="lg:col-span-3">
              <button
                onClick={fetchJobs}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw size={40} className="text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Job Groups */}
            <div className="space-y-6">
              {/* Today's Jobs */}
              {groupedJobs.today.length > 0 && (
                <JobSection
                  title="Today's Jobs"
                  jobs={groupedJobs.today}
                  count={groupedJobs.today.length}
                  isExpanded={expandedSections.today}
                  onToggle={() => toggleSection('today')}
                  onSelectJob={setSelectedJob}
                  onRefresh={fetchJobs}
                />
              )}

              {/* Upcoming Jobs */}
              {groupedJobs.upcoming.length > 0 && (
                <JobSection
                  title="Upcoming Jobs"
                  jobs={groupedJobs.upcoming}
                  count={groupedJobs.upcoming.length}
                  isExpanded={expandedSections.upcoming}
                  onToggle={() => toggleSection('upcoming')}
                  onSelectJob={setSelectedJob}
                  onRefresh={fetchJobs}
                />
              )}

              {/* Past Jobs */}
              {groupedJobs.past.length > 0 && (
                <JobSection
                  title="Past Jobs"
                  jobs={groupedJobs.past}
                  count={groupedJobs.past.length}
                  isExpanded={expandedSections.past}
                  onToggle={() => toggleSection('past')}
                  onSelectJob={setSelectedJob}
                  onRefresh={fetchJobs}
                />
              )}
            </div>

            {/* Empty State */}
            {filteredJobs.length === 0 && !loading && (
              <div className="bg-white rounded-2xl shadow border border-gray-200 p-12 text-center">
                <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || statusFilter !== "All" 
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first job"}
                </p>
                {!showAddJob && (
                  <button
                    onClick={() => setShowAddJob(true)}
                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    <Plus size={20} />
                    Create New Job
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedJob && (
        <JobDrawer
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onRefresh={fetchJobs}
        />
      )}

      {showAddJob && (
        <JobFormDrawer
          onClose={() => setShowAddJob(false)}
          onSuccess={() => {
            setShowAddJob(false);
            fetchJobs();
          }}
        />
      )}
    </div>
  );
}

function JobSection({ title, jobs, count, isExpanded, onToggle, onSelectJob, onRefresh }) {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <span className="bg-gray-100 text-gray-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {count} {count === 1 ? 'job' : 'jobs'}
          </span>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
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