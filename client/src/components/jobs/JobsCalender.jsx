import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import JobDrawer from "./JobDrawer";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function JobsCalendar({ jobs = [], onRefresh }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentView, setCurrentView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const events = jobs.map((job) => {
    // Attempt to parse time or default to 9 AM
    const timePieces = (job.time || "09:00").split(":");
    let hours = parseInt(timePieces[0], 10) || 9;
    const mins = parseInt(timePieces[1], 10) || 0;

    // Convert to 24h if it was provided in AM/PM format (basic fallback)
    if (job.time && job.time.toLowerCase().includes("pm") && hours < 12) {
      hours += 12;
    }

    const start = new Date(job.date);
    start.setHours(hours, mins, 0);

    // Default duration: 2 hours
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    return {
      id: job._id,
      title: `${job.customerName} — ${job.address}`,
      start,
      end,
      resource: job
    };
  });

  const eventStyleGetter = (event) => {
    const status = event.resource.status;
    let bgColor = "#94a3b8"; // surface-4 / muted

    if (status === "Upcoming") bgColor = "#3b82f6"; // blue-500
    if (status === "Completed") bgColor = "#10b981"; // emerald-500
    if (status === "Redo") bgColor = "#f59e0b"; // amber-500
    if (status === "Cancelled") bgColor = "#f43f5e"; // rose-500

    return {
      style: {
        backgroundColor: bgColor,
        borderRadius: "6px",
        color: "#ffffff",
        border: "none",
        fontSize: "12px",
        fontWeight: "500",
        padding: "2px 6px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
      }
    };
  };

  return (
    <div className="card h-[calc(100vh-220px)] min-h-[600px] p-5 animate-fade-in">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={currentView}
        onView={setCurrentView}
        date={currentDate}
        onNavigate={setCurrentDate}
        views={["month", "week", "day"]}
        style={{ height: "100%", fontFamily: "Inter, sans-serif" }}
        onSelectEvent={(event) => setSelectedJob(event.resource)}
        eventPropGetter={eventStyleGetter}
        className="premium-calendar"
      />

      {selectedJob && (
        <JobDrawer
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
