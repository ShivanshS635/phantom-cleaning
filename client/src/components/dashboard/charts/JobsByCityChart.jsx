import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function JobsByCityChart({ jobs }) {
  const cities = {};

  jobs.forEach(job => {
    cities[job.state] = (cities[job.state] || 0) + 1;
  });

  const data = Object.keys(cities).map(city => ({
    city,
    jobs: cities[city]
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="city" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="jobs" fill="#16A34A" />
      </BarChart>
    </ResponsiveContainer>
  );
}
