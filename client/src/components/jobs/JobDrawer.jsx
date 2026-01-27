import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function JobDrawer({ job, onClose, onRefresh }) {
  const [employees, setEmployees] = useState([]);
  const [selectedCleaner, setSelectedCleaner] = useState(
    job.assignedEmployee?._id || ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await api.get("/employees");
      setEmployees(res.data);
    };
    fetchEmployees();
  }, []);

  /* ================= CLEANER UPDATE ================= */
  const updateCleaner = async () => {
    try {
      setLoading(true);
      await api.put(`/jobs/${job._id}/assign`, {
        employeeId: selectedCleaner || null
      });
      onRefresh();
    } catch (err) {
      alert("Failed to update cleaner");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STATUS UPDATE ================= */
  const updateStatus = async (status) => {
    try {
      setLoading(true);
      await api.put(`/jobs/${job._id}/status`, { status });
      onRefresh();
      onClose();
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-end z-50">
      <div className="w-full sm:w-[420px] bg-white h-full p-6 overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Job Details</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* JOB INFO */}
        <div className="space-y-2 text-sm mb-6">
          <p><b>Customer:</b> {job.customerName}</p>
          <p><b>Phone:</b> {job.phone}</p>
          <p><b>Address:</b> {job.address}</p>
          <p><b>Date:</b> {job.date} {job.time}</p>
          <p>
            <b>Status:</b>{" "}
            <span className="font-medium">{job.status}</span>
          </p>
        </div>

        {/* CLEANER ASSIGNMENT */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Assigned Cleaner
          </label>

          <select
            className="border rounded w-full p-2"
            value={selectedCleaner}
            onChange={(e) => setSelectedCleaner(e.target.value)}
          >
            <option value="">Unassigned</option>
            {employees
              .filter((e) => e.role === "Cleaner")
              .map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
          </select>

          <button
            onClick={updateCleaner}
            disabled={loading}
            className="mt-2 w-full bg-black text-white py-2 rounded"
          >
            Update Cleaner
          </button>
        </div>

        {/* STATUS ACTIONS */}
        <div className="space-y-2">
          {/* COMPLETE */}
          {job.status !== "Completed" && job.status !== "Cancelled" && (
            <button
              onClick={() => updateStatus("Completed")}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Mark as Completed
            </button>
          )}

          {/* REDO – ONLY AFTER COMPLETION */}
          {job.status === "Completed" && (
            <button
              onClick={() => updateStatus("Redo")}
              className="w-full bg-yellow-500 text-white py-2 rounded"
            >
              Mark as Redo
            </button>
          )}

          {/* CANCEL – ALWAYS AVAILABLE EXCEPT COMPLETED */}
          {job.status !== "Cancelled" && (
            <button
              onClick={() => updateStatus("Cancelled")}
              className="w-full bg-red-600 text-white py-2 rounded"
            >
              Cancel Job
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
