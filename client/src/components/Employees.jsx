import { useEffect, useState } from "react";
import api from "../api/axios";
import { showSuccess, showError } from "../utils/toast";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    role: "Cleaner",
    city: "",
    notes: ""
  });

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to load employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    try {
      await api.post("/employees", form);
      showSuccess("Employee added successfully");
      setShowForm(false);
      setForm({
        name: "",
        phone: "",
        email: "",
        role: "Cleaner",
        city: "",
        notes: ""
      });
      fetchEmployees();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to add employee");
    }
  };

  const filteredEmployees =
    filter === "All"
      ? employees
      : employees.filter((e) => e.role === filter);

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* ===== LEFT: LIST ===== */}
      <div className="col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Employees</h1>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {showForm ? "Close" : "Add Employee"}
          </button>
        </div>

        {/* ADD FORM */}
        {showForm && (
          <form
            onSubmit={handleAddEmployee}
            className="bg-white p-4 rounded shadow mb-6 grid grid-cols-2 gap-4"
          >
            <input
              placeholder="Name"
              className="border p-2 rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              required
            />

            <select
              className="border p-2 rounded"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option>Cleaner</option>
              <option>Manager</option>
              <option>HR</option>
            </select>

            <input
              placeholder="City"
              className="border p-2 rounded"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />

            <input
              placeholder="Notes"
              className="border p-2 rounded"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <button className="col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Save Employee
            </button>
          </form>
        )}

        {/* FILTER */}
        <div className="mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option>All</option>
            <option>Cleaner</option>
            <option>Manager</option>
            <option>HR</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">City</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp._id}
                  onClick={() => setSelectedEmp(emp)}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-2">{emp.name}</td>
                  <td className="p-2">{emp.role}</td>
                  <td className="p-2">{emp.city}</td>
                  <td className="p-2">{emp.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <p className="p-4 text-center">No employees found</p>
          )}
        </div>
      </div>

      {/* ===== RIGHT: DETAILS ===== */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-bold mb-4">Employee Details</h2>

        {selectedEmp ? (
          <div className="space-y-2">
            <p><b>Name:</b> {selectedEmp.name}</p>
            <p><b>Role:</b> {selectedEmp.role}</p>
            <p><b>City:</b> {selectedEmp.city}</p>
            <p><b>Status:</b> {selectedEmp.status}</p>
            <p><b>Phone:</b> {selectedEmp.phone}</p>
            <p><b>Email:</b> {selectedEmp.email}</p>
            <p>
              <b>Joining:</b>{" "}
              {new Date(selectedEmp.joiningDate).toLocaleDateString()}
            </p>
            <p><b>Notes:</b> {selectedEmp.notes || "—"}</p>
          </div>
        ) : (
          <p>Select an employee to view details</p>
        )}
      </div>
    </div>
  );
}