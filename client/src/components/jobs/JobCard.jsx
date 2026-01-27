export default function JobCard({ job, onClick }) {
    const statusColor = {
        Upcoming: "bg-blue-100 text-blue-700",
        Completed: "bg-green-100 text-green-700",
        Redo: "bg-yellow-100 text-yellow-700",
        Cancelled: "bg-red-100 text-red-700",
    };

    return (
        <div
            onClick={onClick}
            className="border rounded-lg p-4 cursor-pointer hover:shadow transition"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold">{job.customerName}</h3>
                    <p className="text-sm text-gray-500">{job.address}</p>
                    <p className="text-sm mt-1">{job.date}</p>
                    <p className="text-xs text-gray-400">
                        {job.time} · Cleaner:{" "}
                        {job.assignedEmployee?.name || "Unassigned"}
                    </p>

                </div>

                <span
                    className={`text-xs px-2 py-1 rounded ${statusColor[job.status]}`}
                >
                    {job.status}
                </span>
            </div>
        </div>
    );
}
