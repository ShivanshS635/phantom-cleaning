import JobsStatusChart from "./charts/JobsStatusChart";
import RevenueChart from "./charts/RevenueChart";
import JobsByCityChart from "./charts/JobsByCityChart";
import CleanerLoadChart from "./charts/CleanerLoadChart";

export default function DashboardCharts({ jobs }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Jobs Status">
        <JobsStatusChart jobs={jobs} />
      </ChartCard>

      <ChartCard title="Revenue Over Time">
        <RevenueChart jobs={jobs} />
      </ChartCard>

      <ChartCard title="Jobs by City">
        <JobsByCityChart jobs={jobs} />
      </ChartCard>

      <ChartCard title="Cleaner Utilization">
        <CleanerLoadChart jobs={jobs} />
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}