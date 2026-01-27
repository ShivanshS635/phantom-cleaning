import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import api from "../../api/axios";
import JobDrawer from "./JobDrawer";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

export default function JobsCalendar() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const res = await api.get("/jobs");
    const data = res.data.data || res.data; // handles meta wrapper
    setJobs(data);
  };

  const events = jobs.map((job) => {
    const start = new Date(`${job.date}T${job.time || "09:00"}`);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1hr default

    return {
      id: job._id,
      title: `${job.customerName} – ${job.state}`,
      start,
      end,
      resource: job
    };
  });

  const eventStyleGetter = (event) => {
    const status = event.resource.status;

    const colors = {
      Upcoming: "#2563eb",
      Completed: "#16a34a",
      Redo: "#f59e0b",
      Cancelled: "#dc2626"
    };

    return {
      style: {
        backgroundColor: colors[status] || "#6b7280",
        borderRadius: "8px",
        color: "white",
        border: "none",
        padding: "4px 8px"
      }
    };
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-white rounded-xl shadow p-4">
      <h1 className="text-2xl font-semibold mb-4">Jobs Calendar</h1>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month", "week", "day"]}
        defaultView="week"
        style={{ height: "100%" }}
        onSelectEvent={(event) => setSelectedJob(event.resource)}
        eventPropGetter={eventStyleGetter}
      />

      {/* Side Drawer */}
      {selectedJob && (
        <JobDrawer
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onRefresh={fetchJobs}
        />
      )}
    </div>
  );
}
