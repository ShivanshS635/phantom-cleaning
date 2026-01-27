export default function StatusBadge({ status }) {
  const map = {
    Upcoming: "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
    Redo: "bg-yellow-100 text-yellow-700",
    Cancelled: "bg-red-100 text-red-700"
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        map[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}