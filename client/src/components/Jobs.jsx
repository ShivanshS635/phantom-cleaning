import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Sydney",
    date: "",
    time: "",
    price: "",
    assignedEmployee: ""
  });

  console.log("Form State:", form);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      alert("Failed to load jobs");
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      alert("Failed to load employees");
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchEmployees();
  }, []);

  const handleAddJob = async (e) => {
    e.preventDefault();
    console.log("New Job Form Data:", form);

    try {
      await api.post("/jobs", form);
      alert("Job added successfully");
      setShowForm(false);
      setForm({
        customerName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "Sydney",
        date: "",
        time: "",
        price: "",
        assignedEmployee: ""
      });
      
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add job");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/jobs/${id}/status`, { status });
      fetchJobs();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredJobs =
    statusFilter === "All"
      ? jobs
      : jobs.filter((j) => j.status === statusFilter);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Jobs</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {showForm ? "Close" : "Add Job"}
        </button>
      </div>

      {/* ADD JOB FORM */}
      {showForm && (
        <form
          onSubmit={handleAddJob}
          className="bg-white p-4 rounded shadow mb-6 grid grid-cols-3 gap-4"
        >
          <input
            placeholder="Customer Name"
            className="border p-2 rounded"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            required
          />

          <input
            placeholder="Phone"
            className="border p-2 rounded"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            placeholder="Address"
            className="border p-2 rounded col-span-2"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <input
            placeholder="City"
            className="border p-2 rounded"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />

          <select
            className="border p-2 rounded"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          >
            <option>Sydney</option>
            <option>Melbourne</option>
            <option>Adelaide</option>
            <option>Perth</option>
            <option>Brisbane</option>
          </select>

          <input
            type="date"
            className="border p-2 rounded"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <input
            type="time"
            className="border p-2 rounded"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />

          <input
            type="number"
            placeholder="Price"
            className="border p-2 rounded"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <select
            className="border p-2 rounded"
            value={form.assignedEmployee}
            onChange={(e) =>
              setForm({ ...form, assignedEmployee: e.target.value })
            }
          >
            <option value="">Assign Cleaner</option>
            {employees
              .filter((e) => e.role === "Cleaner")
              .map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
          </select>

          <button className="col-span-3 bg-green-600 text-white py-2 rounded hover:bg-green-700">
            Save Job
          </button>
        </form>
      )}

      {/* FILTER */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option>All</option>
          <option>Upcoming</option>
          <option>Completed</option>
          <option>Redo</option>
        </select>
      </div>

      {/* JOB LIST */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Customer</th>
              <th className="p-2">City</th>
              <th className="p-2">Date</th>
              <th className="p-2">Cleaner</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job._id} className="border-t text-center">
                <td className="p-2">{job.customerName}</td>
                <td className="p-2">{job.state}</td>
                <td className="p-2">
                  {job.date} {job.time}
                </td>
                <td className="p-2">
                  {job.assignedEmployee?.name || "—"}
                </td>
                <td className="p-2">{job.status}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => updateStatus(job._id, "Completed")}
                    className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => updateStatus(job._id, "Redo")}
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Redo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredJobs.length === 0 && (
          <p className="p-4 text-center">No jobs found</p>
        )}
      </div>
    </div>
  );
}