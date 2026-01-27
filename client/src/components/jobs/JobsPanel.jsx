import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import JobCard from "./JobCard";
import JobDrawer from "./JobDrawer";
import JobFormDrawer from "./JobFormDrawer";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAddJob, setShowAddJob] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchJobs = async () => {
    const res = await api.get("/jobs");
    setJobs(res.data.data || []);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs =
    statusFilter === "All"
      ? jobs
      : jobs.filter((j) => j.status === statusFilter);

  const groupedJobs = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return filteredJobs.reduce(
      (acc, job) => {
        if (job.date === today) acc.today.push(job);
        else if (job.date > today) acc.upcoming.push(job);
        else acc.past.push(job);
        return acc;
      },
      { today: [], upcoming: [], past: [] }
    );
  }, [filteredJobs]);

  console.log("jobs", jobs);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Jobs</h1>
          <p className="text-sm text-gray-500">
            Manage and monitor all cleaning jobs
          </p>
        </div>

        <div className="flex gap-3">
          <select
            className="border rounded-lg px-4 py-2 text-sm bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Upcoming</option>
            <option>Completed</option>
            <option>Redo</option>
            <option>Cancelled</option>
          </select>

          <button
            onClick={() => setShowAddJob(true)}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm"
          >
            + Add Job
          </button>
        </div>
      </div>

      {/* GROUPS */}
      {groupedJobs.today.length > 0 && (
        <Section title="Today" jobs={groupedJobs.today} onSelect={setSelectedJob} onRefresh={fetchJobs} />
      )}

      {groupedJobs.upcoming.length > 0 && (
        <Section title="Upcoming" jobs={groupedJobs.upcoming} onSelect={setSelectedJob} onRefresh={fetchJobs} />
      )}

      {groupedJobs.past.length > 0 && (
        <Section title="Past Jobs" jobs={groupedJobs.past} onSelect={setSelectedJob} onRefresh={fetchJobs} />
      )}

      {filteredJobs.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No jobs found
        </div>
      )}

      {/* DRAWERS */}
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

function Section({ title, jobs, onSelect, onRefresh }) {
  return (
    <section className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">{title}</h2>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
          {jobs.length} jobs
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            onClick={() => onSelect(job)}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </section>
  );
}
