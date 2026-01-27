import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function RevenueChart({ jobs }) {
  const revenueByDate = {};

  jobs.forEach(job => {
    if (job.status === "Completed") {
      revenueByDate[job.date] =
        (revenueByDate[job.date] || 0) + job.price;
    }
  });

  const data = Object.keys(revenueByDate).map(date => ({
    date,
    revenue: revenueByDate[date]
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#2563EB"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
