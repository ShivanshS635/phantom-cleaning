import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#2563EB", "#16A34A", "#F59E0B"];

export default function JobsStatusChart({ jobs }) {
  const data = ["Upcoming", "Completed", "Redo"].map(status => ({
    name: status,
    value: jobs.filter(j => j.status === status).length
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={60}
          outerRadius={90}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
