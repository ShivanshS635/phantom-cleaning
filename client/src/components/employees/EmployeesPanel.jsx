import { useEffect, useState } from "react";
import api from "../../api/axios";
import { showSuccess, showError } from "../../utils/toast";
import {
  Plus,
  X,
  Edit2,
  Trash2,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Search,
  Filter,
  Loader2
} from "lucide-react";
import ConfirmationModal from "../common/ConfirmationModal";

export default function EmployeesPanel() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterState, setFilterState] = useState("All");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger",
    isLoading: false
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Cleaner",
    state: "Sydney"
  });

  const roles = ["All", "Cleaner", "Manager", "HR"];
  const states = ["All", "Sydney", "Melbourne", "Adelaide", "Perth", "Brisbane"];

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", role: "Cleaner", state: "Sydney" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, form);
        showSuccess("Employee updated successfully");
      } else {
        await api.post("/employees", form);
        showSuccess("Employee added successfully");
      }

      setShowForm(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      showError(err.response?.data?.message || `Failed to ${editingId ? 'update' : 'add'} employee`);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = (employee) => {
    setForm(employee);
    setEditingId(employee._id);
    setShowForm(true);
  };

  const handleDelete = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Employee",
      message: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          await api.delete(`/employees/${id}`);
          showSuccess("Employee deleted successfully");
          fetchEmployees();
        } catch (err) {
          showError(err.response?.data?.message || "Failed to delete employee");
        } finally {
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, type: "danger", isLoading: false });
        }
      }
    });
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" || emp.role === filterRole;
    const matchesState = filterState === "All" || emp.state === filterState;

    return matchesSearch && matchesRole && matchesState;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
              <p className="text-gray-600 mt-1">Manage your team members</p>
            </div>
            <button
              onClick={() => {
                if (showForm) {
                  setShowForm(false);
                  resetForm();
                } else {
                  setShowForm(true);
                }
              }}
              className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              {showForm ? (
                <>
                  <X size={20} />
                  Close Form
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Add Employee
                </>
              )}
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mb-8 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingId ? "Edit Employee" : "Add New Employee"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        placeholder="+61 400 000 000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none bg-white"
                      >
                        <option value="Cleaner">Cleaner</option>
                        <option value="Manager">Manager</option>
                        <option value="HR">HR</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <select
                        name="state"
                        value={form.state}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none bg-white"
                        required
                      >
                        <option value="Sydney">Sydney</option>
                        <option value="Melbourne">Melbourne</option>
                        <option value="Adelaide">Adelaide</option>
                        <option value="Perth">Perth</option>
                        <option value="Brisbane">Brisbane</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    disabled={formSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {formSubmitting && <Loader2 size={20} className="animate-spin" />}
                    {editingId ? "Update Employee" : "Save Employee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-2xl shadow p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <Filter className="text-gray-400 mt-2" size={20} />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role === "All" ? "All Roles" : role}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              {states.map(state => (
                <option key={state} value={state}>
                  {state === "All" ? "All Locations" : state}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={40} className="text-gray-400 animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Employee</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Contact</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Role</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Location</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-gray-900">{emp.name}</div>
                            <div className="text-sm text-gray-500">ID: {emp._id.slice(-6)}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            {emp.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail size={14} className="text-gray-400" />
                                <span className="text-gray-700">{emp.email}</span>
                              </div>
                            )}
                            {emp.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone size={14} className="text-gray-400" />
                                <span className="text-gray-700">{emp.phone}</span>
                              </div>
                            )}
                            {!emp.email && !emp.phone && (
                              <span className="text-gray-500 text-sm">No contact info</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${emp.role === "Manager"
                            ? "bg-blue-100 text-blue-800"
                            : emp.role === "HR"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                            }`}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-400" />
                            <span className="text-gray-700">{emp.state}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(emp)}
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(emp._id, emp.name)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredEmployees.length === 0 && (
                <div className="text-center py-16">
                  <User className="mx-auto text-gray-400" size={48} />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No employees found</h3>
                  <p className="mt-2 text-gray-600">
                    {searchTerm || filterRole !== "All" || filterState !== "All"
                      ? "Try adjusting your search or filters"
                      : "Get started by adding your first employee"}
                  </p>
                  {!showForm && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-4 inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium"
                    >
                      <Plus size={20} />
                      Add Employee
                    </button>
                  )}
                </div>
              )}

              {filteredEmployees.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-medium">{filteredEmployees.length}</span> of{" "}
                    <span className="font-medium">{employees.length}</span> employees
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>


      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
}