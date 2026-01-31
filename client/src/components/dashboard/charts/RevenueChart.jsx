import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";

export default function RevenueChart({ jobs }) {
  const revenueByDate = {};
  const jobsByDate = {};

  jobs.forEach(job => {
    if (job.status === "Completed" && job.date) {
      revenueByDate[job.date] = (revenueByDate[job.date] || 0) + (job.price || 0);
      jobsByDate[job.date] = (jobsByDate[job.date] || 0) + 1;
    }
  });

  const data = Object.keys(revenueByDate)
    .sort()
    .slice(-30) // Last 30 days
    .map(date => ({
      date: new Date(date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
      revenue: revenueByDate[date],
      jobs: jobsByDate[date] || 0
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          stroke="#666"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#666"
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip 
          formatter={(value, name) => [
            name === 'revenue' ? `$${Number(value).toLocaleString()}` : value,
            name === 'revenue' ? 'Revenue' : 'Jobs'
          ]}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
          name="Revenue"
        />
        <Line
          type="monotone"
          dataKey="jobs"
          stroke="#10b981"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ r: 3 }}
          name="Jobs Completed"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}