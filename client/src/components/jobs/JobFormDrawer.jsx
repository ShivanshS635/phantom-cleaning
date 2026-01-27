import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function JobFormDrawer({ onClose, onSuccess }) {
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Sydney",
    date: "",
    time: "",
    estTime: "",
    areas: "",
    workType: "",
    notes: "",
    price: "",
    assignedEmployee: "",
  });

  useEffect(() => {
    api.get("/employees").then((res) => {
      setEmployees(res.data || []);
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    await api.post("/jobs", {
      ...form,
      status: "Upcoming",
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="w-full max-w-xl bg-white h-full overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create New Job</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        {/* Customer */}
        <section className="space-y-3">
          <h3 className="font-medium">Customer Details</h3>

          <input name="customerName" placeholder="Customer Name" className="input" onChange={handleChange} />
          <input name="phone" placeholder="Phone" className="input" onChange={handleChange} />
          <input name="email" placeholder="Email" className="input" onChange={handleChange} />
        </section>

        {/* Location */}
        <section className="space-y-3">
          <h3 className="font-medium">Location</h3>

          <input name="address" placeholder="Address" className="input" onChange={handleChange} />
          <div className="grid grid-cols-2 gap-3">
            <input name="city" placeholder="City" className="input" onChange={handleChange} />

            <select name="state" className="input" onChange={handleChange}>
              <option>Sydney</option>
              <option>Melbourne</option>
              <option>Brisbane</option>
              <option>Adelaide</option>
              <option>Perth</option>
            </select>
          </div>
        </section>

        {/* Schedule */}
        <section className="space-y-3">
          <h3 className="font-medium">Schedule</h3>

          <div className="grid grid-cols-3 gap-3">
            <input type="date" name="date" className="input" onChange={handleChange} />
            <input type="time" name="time" className="input" onChange={handleChange} />
            <input name="estTime" placeholder="Est. Time (hrs)" className="input" onChange={handleChange} />
          </div>
        </section>

        {/* Job */}
        <section className="space-y-3">
          <h3 className="font-medium">Job Details</h3>

          <input name="areas" placeholder="Areas to clean" className="input" onChange={handleChange} />
          <input name="workType" placeholder="Work Type" className="input" onChange={handleChange} />
          <textarea name="notes" placeholder="Job Notes" className="input h-20" onChange={handleChange} />
        </section>

        {/* Assignment */}
        <section className="space-y-3">
          <h3 className="font-medium">Assignment</h3>

          <select
            name="assignedEmployee"
            className="input"
            onChange={handleChange}
          >
            <option value="">Assign Cleaner (optional)</option>
            {employees
              .filter((e) => e.role === "Cleaner")
              .map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
          </select>
        </section>

        {/* Price */}
        <section className="space-y-3">
          <h3 className="font-medium">Pricing</h3>

          <input
            type="number"
            name="price"
            placeholder="Price"
            className="input"
            onChange={handleChange}
          />
        </section>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={submit}
            className="flex-1 bg-black text-white py-2 rounded-lg"
          >
            Create Job
          </button>

          <button
            onClick={onClose}
            className="flex-1 border py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
