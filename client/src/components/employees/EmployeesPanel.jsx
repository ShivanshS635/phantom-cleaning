import { useEffect, useState } from "react";
import api from "../../api/axios";
import { showSuccess, showError } from "../../utils/toast";

export default function EmployeesPanel() {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Cleaner",
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

  const addEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post("/employees", form);
      showSuccess("Employee added successfully");
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", role: "Cleaner" });
      fetchEmployees();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to add employee");
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Employees</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {showForm ? "Close" : "Add Employee"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={addEmployee}
          className="bg-white p-4 rounded shadow grid grid-cols-2 gap-4 mb-6"
        >
          <input
            placeholder="Name"
            className="border p-2 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            placeholder="Email"
            className="border p-2 rounded"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            placeholder="Phone"
            className="border p-2 rounded"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
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

          <button className="col-span-2 bg-green-600 text-white py-2 rounded">
            Save Employee
          </button>
        </form>
      )}

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id} className="border-t text-center">
                <td className="p-2">{emp.name}</td>
                <td>{emp.email || "—"}</td>
                <td>{emp.phone || "—"}</td>
                <td>{emp.role}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {employees.length === 0 && (
          <p className="p-4 text-center">No employees found</p>
        )}
      </div>
    </div>
  );
}