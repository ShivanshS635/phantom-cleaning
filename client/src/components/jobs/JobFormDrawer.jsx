// JobFormDrawer.jsx - Improved version
import { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Clock4,
  DollarSign,
  FileText,
  Home,
  Loader2,
  PlusCircle
} from "lucide-react";
import api from "../../api/axios";
import { showSuccess, showError } from "../../utils/toast";

export default function JobFormDrawer({ onClose, onSuccess }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Sydney",
    date: new Date().toISOString().split('T')[0],
    time: "09:00",
    estTime: "2",
    areas: "",
    workType: "Standard Clean",
    notes: "",
    price: "",
    assignedEmployee: "",
  });

  const workTypes = [
    "Standard Clean",
    "Deep Clean",
    "End of Lease",
    "Move In/Out",
    "Commercial Clean",
    "Carpet Clean"
  ];

  const states = ["Sydney", "Melbourne", "Brisbane", "Adelaide", "Perth"];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data || []);
    } catch (err) {
      showError("Failed to load employees");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updates = { [name]: value };
      // Clear assigned employee if state changes
      if (name === "state") {
        updates.assignedEmployee = "";
      }
      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/jobs", {
        ...form,
        status: "Upcoming",
      });
      showSuccess("Job created successfully");
      onSuccess();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-primary/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl">
        <div className="h-full bg-surface-0 shadow-float flex flex-col animate-fade-left">
          {/* Header */}
          <div className="px-6 py-4 border-b border-surface-3 flex items-center justify-between bg-surface-1">
            <div>
              <h2 className="text-xl font-bold text-ink-primary">Create New Job</h2>
              <p className="text-sm text-ink-secondary mt-0.5">Fill in the job details below</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-2 rounded-xl text-ink-muted transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8">
              {/* Customer Section */}
              <section>
                <h3 className="text-xs font-bold text-ink-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <User size={16} className="text-ink-muted" />
                  Customer Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      name="customerName"
                      value={form.customerName}
                      onChange={handleChange}
                      className="input-premium"
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        className="input-premium pl-10"
                        placeholder="+61 400 000 000"
                        required
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="input-premium pl-10"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Location Section */}
              <section>
                <h3 className="text-xs font-bold text-ink-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-ink-muted" />
                  Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="input-premium pl-10"
                        placeholder="123 Main Street"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="input-premium"
                      placeholder="Suburb"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className="input-premium"
                      required
                    >
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Schedule Section */}
              <section>
                <h3 className="text-xs font-bold text-ink-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Calendar size={16} className="text-ink-muted" />
                  Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        className="input-premium pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="time"
                        name="time"
                        value={form.time}
                        onChange={handleChange}
                        className="input-premium pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Est. Hours
                    </label>
                    <div className="relative">
                      <Clock4 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        name="estTime"
                        type="number"
                        min="1"
                        value={form.estTime}
                        onChange={handleChange}
                        className="input-premium pl-10"
                        placeholder="2"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Job Details Section */}
              <section>
                <h3 className="text-xs font-bold text-ink-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-ink-muted" />
                  Job Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Type
                    </label>
                    <select
                      name="workType"
                      value={form.workType}
                      onChange={handleChange}
                      className="input-premium"
                    >
                      {workTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={handleChange}
                        className="input-premium pl-10"
                        placeholder="150.00"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Areas to Clean
                    </label>
                    <input
                      name="areas"
                      value={form.areas}
                      onChange={handleChange}
                      className="input-premium"
                      placeholder="Living room, 3 bedrooms, 2 bathrooms"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows="3"
                      className="input-premium resize-none"
                      placeholder="Special instructions or requirements..."
                    />
                  </div>
                </div>
              </section>

              {/* Assignment Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-ink-primary uppercase tracking-widest flex items-center gap-2">
                    <User size={16} className="text-ink-muted" />
                    Assignment
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs font-medium text-ink-secondary hover:text-ink-primary transition-colors"
                  >
                    {showAdvanced ? "Hide advanced" : "Show advanced"}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-secondary mb-2">
                    Assign Cleaner (Optional)
                  </label>
                  <select
                    name="assignedEmployee"
                    value={form.assignedEmployee}
                    onChange={handleChange}
                    className="input-premium appearance-none"
                  >
                    <option value="">Select a cleaner</option>
                    {employees
                      .filter(e => e.role === "Cleaner" && e.state === form.state)
                      .map(emp => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name} • {emp.state}
                        </option>
                      ))}
                  </select>
                </div>

                {showAdvanced && (
                  <div className="mt-4 p-4 bg-surface-1 rounded-xl border border-surface-3 space-y-3">
                    <p className="text-sm font-semibold text-ink-primary">Advanced Options</p>
                    {/* Add any advanced options here */}
                  </div>
                )}
              </section>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-surface-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 shadow-brand inline-flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {!loading && <PlusCircle size={18} />}
                  Create Job
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}