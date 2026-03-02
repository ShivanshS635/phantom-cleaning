import { useEffect, useState } from "react";
import api from "../../api/axios";
import { showSuccess, showError } from "../../utils/toast";
import {
  Plus, X, Edit2, Trash2, User, Mail, Phone, Briefcase,
  MapPin, Search, Filter, Loader2, Users,
} from "lucide-react";
import ConfirmationModal from "../common/ConfirmationModal";

const AVATAR_GRADIENTS = [
  "from-brand-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-purple-500 to-violet-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
];

function getAvatarGradient(name = "") {
  let h = 0; for (const c of name) h += c.charCodeAt(0);
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

const ROLE_BADGE = {
  Manager: "bg-blue-50 text-blue-700 border-blue-200",
  HR: "bg-purple-50 text-purple-700 border-purple-200",
  Cleaner: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function EmployeesPanel() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterState, setFilterState] = useState("All");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: "", message: "", onConfirm: null, type: "danger", isLoading: false,
  });

  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: "Cleaner", state: "Sydney",
  });
  const [inviteLink, setInviteLink] = useState("");

  const roles = ["All", "Cleaner", "Manager", "HR"];
  const states = ["All", "Sydney", "Melbourne", "Adelaide", "Perth", "Brisbane"];

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to load employees");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", role: "Cleaner", state: "Sydney" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editingId) {
        // Edit existing employee
        await api.put(`/employees/${editingId}`, form);
        showSuccess("Employee updated");
        setShowForm(false);
        resetForm();
        fetchEmployees();
      } else {
        // Invite new member
        const res = await api.post("/auth/invite", { email: form.email, role: form.role });
        setInviteLink(res.data.inviteLink);
        showSuccess("Invitation link generated!");
        // We do not close the form immediately so they can copy the link
      }
    } catch (err) {
      showError(err.response?.data?.message || "Operation failed");
    } finally { setFormSubmitting(false); }
  };

  const handleEdit = (emp) => {
    setForm(emp); setEditingId(emp._id); setShowForm(true);
  };

  const handleDelete = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Employee",
      message: `Remove ${name} from the team? This cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, isLoading: true }));
        try {
          await api.delete(`/employees/${id}`);
          showSuccess("Employee removed");
          fetchEmployees();
        } catch (err) {
          showError(err.response?.data?.message || "Failed to delete");
        } finally {
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, type: "danger", isLoading: false });
        }
      },
    });
  };

  const filtered = employees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch &&
      (filterRole === "All" || emp.role === filterRole) &&
      (filterState === "All" || emp.state === filterState);
  });

  return (
    <div className="min-h-screen bg-surface-1">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600/10 flex items-center justify-center">
              <Users size={18} className="text-brand-600" />
            </div>
            <span className="badge bg-surface-2 text-ink-primary font-semibold">
              {employees.length} employees
            </span>
          </div>
          <button
            onClick={() => { if (showForm) { setShowForm(false); resetForm(); setInviteLink(""); } else setShowForm(true); }}
            className={showForm ? "btn-secondary text-sm" : "btn-primary text-sm shadow-brand"}
          >
            {showForm ? <><X size={15} />Close</> : <><Mail size={15} />Invite Member</>}
          </button>
        </div>

        {/* ── Add/Edit / Invite Form ── */}
        {showForm && (
          <div className="card p-6 animate-fade-up border border-brand-500/20">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-ink-primary">
                  {editingId ? "Edit Employee" : "Invite New Member"}
                </h2>
                {!editingId && <p className="text-xs text-ink-muted mt-1">Send a secure registration link to a new team member.</p>}
              </div>
              <button
                onClick={() => { setShowForm(false); resetForm(); setInviteLink(""); }}
                className="p-1.5 rounded-lg hover:bg-surface-2 text-ink-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {inviteLink ? (
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 space-y-3 animate-fade-up">
                <div className="flex items-center gap-2 text-brand-700">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                    <Mail size={16} />
                  </div>
                  <h3 className="font-semibold text-sm">Invitation Generated Successfully</h3>
                </div>
                <p className="text-sm text-brand-700/80">
                  Share this secure link with the new team member. It expires in 48 hours.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="input-premium flex-1 truncate bg-white font-mono text-xs"
                    onClick={(e) => { e.target.select(); navigator.clipboard.writeText(inviteLink); showSuccess("Link copied to clipboard!"); }}
                  />
                  <button
                    onClick={() => { navigator.clipboard.writeText(inviteLink); showSuccess("Link copied to clipboard!"); }}
                    className="btn-primary py-2.5 text-sm whitespace-nowrap"
                  >
                    Copy Link
                  </button>
                </div>
                <button
                  onClick={() => { setShowForm(false); resetForm(); setInviteLink(""); }}
                  className="btn-secondary w-full text-sm mt-2"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  {editingId ? (
                    // Edit Mode (Legacy direct edit support)
                    <>
                      {[{ label: "Full Name", name: "name", type: "text", icon: User },
                      { label: "Email", name: "email", type: "email", icon: Mail },
                      { label: "Phone", name: "phone", type: "tel", icon: Phone }
                      ].map(({ label, name, type, icon: Icon }) => (
                        <div key={name} className="space-y-1.5">
                          <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">{label}</label>
                          <div className="relative">
                            <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                            <input
                              type={type} name={name} value={form[name]}
                              onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                              required className="input-premium pl-9 text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    // Invite Mode
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">Email Address</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                        <input
                          type="email" name="email" value={form.email}
                          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="team.member@example.com"
                          required className="input-premium pl-9 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className={editingId ? "" : "md:col-span-2"}>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">Assigned Role</label>
                      <div className="relative">
                        <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                        <select
                          name="role" value={form.role}
                          onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                          className="input-premium pl-9 pr-4 text-sm appearance-none border-brand-500/30 focus:border-brand-500/50 focus:ring-brand-500/20"
                        >
                          <option>Cleaner</option>
                          <option>Manager</option>
                          <option>HR</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {editingId && (
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">Location</label>
                      <div className="relative">
                        <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                        <select
                          name="state" value={form.state}
                          onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                          className="input-premium pl-9 pr-4 text-sm appearance-none"
                          required
                        >
                          {["Sydney", "Melbourne", "Adelaide", "Perth", "Brisbane"].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-3">
                  <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary text-sm" disabled={formSubmitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-sm shadow-brand" disabled={formSubmitting}>
                    {formSubmitting && <Loader2 size={15} className="animate-spin" />}
                    {editingId ? "Update Employee" : "Generate Invitation Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── Filters ── */}
        <div className="card p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text" placeholder="Search by name or email…"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="input-premium pl-9 py-2.5 text-sm"
              />
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                className="input-premium pl-8 pr-10 py-2.5 text-sm w-36 appearance-none">
                {roles.map(r => <option key={r} value={r}>{r === "All" ? "All Roles" : r}</option>)}
              </select>
            </div>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <select value={filterState} onChange={e => setFilterState(e.target.value)}
                className="input-premium pl-8 pr-10 py-2.5 text-sm w-40 appearance-none">
                {states.map(s => <option key={s} value={s}>{s === "All" ? "All Locations" : s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center mx-auto">
                  <Loader2 size={20} className="text-brand-600 animate-spin" />
                </div>
                <p className="text-sm text-ink-muted">Loading team members…</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-3 bg-surface-1">
                      <th className="py-3 px-5 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Employee</th>
                      <th className="py-3 px-5 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Contact</th>
                      <th className="py-3 px-5 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Role</th>
                      <th className="py-3 px-5 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Location</th>
                      <th className="py-3 px-5 text-right text-xs font-semibold text-ink-muted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-3">
                    {filtered.map(emp => (
                      <tr key={emp._id} className="table-row-hover group">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarGradient(emp.name)} flex items-center justify-center shrink-0`}>
                              <span className="text-xs font-bold text-white">{getInitials(emp.name)}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-ink-primary">{emp.name}</p>
                              <p className="text-xs text-ink-muted">#{emp._id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="space-y-0.5">
                            {emp.email && (
                              <div className="flex items-center gap-1.5">
                                <Mail size={12} className="text-ink-muted" />
                                <span className="text-xs text-ink-secondary">{emp.email}</span>
                              </div>
                            )}
                            {emp.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone size={12} className="text-ink-muted" />
                                <span className="text-xs text-ink-secondary">{emp.phone}</span>
                              </div>
                            )}
                            {!emp.email && !emp.phone && (
                              <span className="text-xs text-ink-muted italic">No contact info</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`badge border ${ROLE_BADGE[emp.role] || "bg-surface-2 text-ink-secondary border-surface-3"}`}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-ink-muted" />
                            <span className="text-sm text-ink-secondary">{emp.state}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(emp)} className="p-1.5 rounded-lg hover:bg-brand-50 hover:text-brand-600 text-ink-muted transition-colors" title="Edit">
                              <Edit2 size={15} />
                            </button>
                            <button onClick={() => handleDelete(emp._id, emp.name)} className="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-ink-muted transition-colors" title="Delete">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-3">
                    <User size={22} className="text-ink-muted" />
                  </div>
                  <h3 className="text-base font-semibold text-ink-primary mb-1">No employees found</h3>
                  <p className="text-sm text-ink-muted mb-5">
                    {searchTerm || filterRole !== "All" || filterState !== "All"
                      ? "Try adjusting your filters"
                      : "Add your first team member"}
                  </p>
                  {!showForm && (
                    <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">
                      <Plus size={16} /> Add Employee
                    </button>
                  )}
                </div>
              )}

              {filtered.length > 0 && (
                <div className="px-5 py-3 border-t border-surface-3 bg-surface-1 flex items-center justify-between">
                  <p className="text-xs text-ink-muted">
                    Showing <span className="font-semibold text-ink-primary">{filtered.length}</span> of <span className="font-semibold text-ink-primary">{employees.length}</span> employees
                  </p>
                  <div className="flex gap-2">
                    {["Cleaner", "Manager", "HR"].map(role => {
                      const count = employees.filter(e => e.role === role).length;
                      return count > 0 ? (
                        <span key={role} className={`badge border text-xs ${ROLE_BADGE[role]}`}>
                          {count} {role}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
}