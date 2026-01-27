import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function CleanerLoadChart({ jobs }) {
  const cleaners = {};

  jobs.forEach(job => {
    if (job.assignedEmployee?.name) {
      cleaners[job.assignedEmployee.name] =
        (cleaners[job.assignedEmployee.name] || 0) + 1;
    }
  });

  const data = Object.keys(cleaners).map(name => ({
    cleaner: name,
    jobs: cleaners[name]
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" />
        <YAxis dataKey="cleaner" type="category" />
        <Tooltip />
        <Bar dataKey="jobs" fill="#F59E0B" />
      </BarChart>
    </ResponsiveContainer>
  );
}
