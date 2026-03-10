import React, { useState, useEffect } from 'react';
import { X, Save, Plus, DollarSign, Calendar, User } from 'lucide-react';
import api from '../../api/axios';
import { showSuccess, showError } from '../../utils/toast';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const defaultFormData = {
    employee: '',
    state: 'Sydney',
    weekStartDate: '',
    weekEndDate: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    weekNumber: 1,
    dailyBreakdown: {
        monday: { hours: 0, amount: 0 },
        tuesday: { hours: 0, amount: 0 },
        wednesday: { hours: 0, amount: 0 },
        thursday: { hours: 0, amount: 0 },
        friday: { hours: 0, amount: 0 },
        saturday: { hours: 0, amount: 0 },
        sunday: { hours: 0, amount: 0 }
    },
    baseSalary: 0,
    bonuses: [],
    deductions: [],
    totalAmount: 0,
    status: 'Unpaid',
    paymentMethod: 'Bank Transfer'
};

export default function AddSalaryModal({ isOpen, onClose, onSuccess, initialData }) {
    const isEditing = !!initialData;
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(() => {
        if (initialData) {
            // Format weekStartDate for input[type=date]
            const startDate = initialData.weekStartDate
                ? new Date(initialData.weekStartDate).toISOString().split('T')[0]
                : '';
            return {
                ...defaultFormData,
                ...initialData,
                employee: initialData.employee?._id || initialData.employee,
                weekStartDate: startDate,
            };
        }
        return defaultFormData;
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await api.get('/employees');
                setEmployees(res.data.filter(e => e.status === 'Active'));
            } catch (err) {
                showError("Failed to load employees");
            }
        };
        fetchEmployees();
    }, []);

    // Set week end date automatically based on start date
    useEffect(() => {
        if (formData.weekStartDate) {
            // Parse date parts directly to avoid UTC→local timezone shift
            const [y, m, d] = formData.weekStartDate.split('-').map(Number);
            //const start = new Date(y, m - 1, d); // local time, no UTC shift

            const end = new Date(y, m - 1, d + 6);

            // Week of Month: which week within the month does this date fall in?
            const firstDayOfMonth = new Date(y, m - 1, 1);
            const weekNum = Math.ceil((d + firstDayOfMonth.getDay()) / 7);

            const pad = n => String(n).padStart(2, '0');
            const endStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;

            setFormData(prev => ({
                ...prev,
                weekEndDate: endStr,
                weekNumber: weekNum,
                month: m,
                year: y
            }));
        }
    }, [formData.weekStartDate]);

    // Calculate total whenever components change
    useEffect(() => {
        const bonuses = formData.bonuses.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
        const deductions = formData.deductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

        // Calculate total daily amount
        const dailyAmountTotal = DAYS.reduce((sum, day) => {
            return sum + (Number(formData.dailyBreakdown[day].amount) || 0);
        }, 0);

        // Total = Base + daily amounts + bonuses - deductions
        setFormData(prev => ({
            ...prev,
            totalAmount: (Number(prev.baseSalary) || 0) + dailyAmountTotal + bonuses - deductions
        }));
    }, [formData.baseSalary, formData.bonuses, formData.deductions, formData.dailyBreakdown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.employee || !formData.weekStartDate) {
            return showError("Please select an employee and week");
        }

        try {
            setLoading(true);
            if (isEditing) {
                await api.put(`/salary/${initialData._id}`, formData);
                showSuccess("Salary record updated");
            } else {
                await api.post('/salary', formData);
                showSuccess("Salary record created");
            }
            onSuccess();
        } catch (err) {
            showError(err.response?.data?.message || "Failed to save record");
        } finally {
            setLoading(false);
        }
    };

    const addBonus = () => {
        setFormData({
            ...formData,
            bonuses: [...formData.bonuses, { description: '', amount: 0 }]
        });
    };

    const addDeduction = () => {
        setFormData({
            ...formData,
            deductions: [...formData.deductions, { description: '', amount: 0 }]
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-ink-primary/30 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-surface-0 w-full max-w-5xl max-h-[98vh] sm:max-h-[95vh] flex flex-col rounded-2xl border border-surface-3 shadow-float animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-surface-3 flex justify-between items-center bg-surface-1 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-ink-primary tracking-tight">{isEditing ? 'Edit Payroll' : 'Generate Payroll'}</h2>
                        <p className="text-[10px] text-ink-muted font-bold uppercase tracking-widest mt-0.5">{isEditing ? 'Update existing record' : 'Weekly Salary Entry'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface-2 rounded-xl text-ink-muted transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 bg-surface-1/50 p-4 sm:p-5 rounded-xl border border-surface-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider flex items-center gap-2">
                                <User size={12} className="text-brand-600" /> Employee
                            </label>
                            <select
                                required
                                className="input-premium py-2"
                                value={formData.employee}
                                onChange={(e) => {
                                    const emp = employees.find(x => x._id === e.target.value);
                                    setFormData({ ...formData, employee: e.target.value, state: emp?.state || 'Sydney' });
                                }}
                            >
                                <option value="">Select Employee</option>
                                {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider flex items-center gap-2">
                                <Calendar size={12} className="text-brand-600" /> Start Date
                            </label>
                            <input
                                type="date"
                                required
                                className="input-premium py-2"
                                value={formData.weekStartDate}
                                onChange={(e) => setFormData({ ...formData, weekStartDate: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider flex items-center gap-2">
                                <DollarSign size={12} className="text-brand-600" /> Base Pay (if any)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm">$</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="input-premium pl-8 py-2 font-semibold"
                                    value={formData.baseSalary}
                                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Daily Breakdown */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <div className="h-4 w-1 bg-brand-600 rounded-full"></div>
                            <h3 className="text-xs font-bold text-ink-primary uppercase tracking-widest">Daily Commission</h3>
                            <span className="text-[10px] text-ink-muted font-normal lowercase ml-2">(Enter total payout earned for each day)</span>
                        </div>

                        <div className="bg-surface-0 rounded-xl border border-surface-3 overflow-x-auto overflow-y-hidden shadow-sm">
                            <table className="w-full border-collapse min-w-[300px]">
                                <thead className="bg-surface-1 text-[10px] font-bold text-ink-muted uppercase tracking-widest">
                                    <tr>
                                        <th className="py-3 px-6 font-bold border-r border-surface-3 text-left">Day</th>
                                        <th className="py-3 px-6 font-bold text-emerald-600 text-center">Commission Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-3">
                                    {DAYS.map(day => (
                                        <tr key={day} className="group hover:bg-surface-1/50 transition-colors">
                                            <td className="py-2.5 sm:py-3 px-4 sm:px-6 text-[10px] sm:text-[11px] font-bold text-ink-secondary uppercase tracking-widest border-r border-surface-3 w-32 sm:w-48 bg-surface-1/30">
                                                {day}
                                            </td>
                                            <td className="py-2 px-4 sm:px-6">
                                                <div className="flex items-center justify-center gap-3">
                                                    <span className="text-xs text-emerald-600/50 font-bold">$</span>
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        className="w-full max-w-[120px] bg-transparent text-center text-emerald-700 text-sm font-bold focus:outline-none"
                                                        value={formData.dailyBreakdown[day].amount}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            dailyBreakdown: {
                                                                ...formData.dailyBreakdown,
                                                                [day]: { ...formData.dailyBreakdown[day], amount: e.target.value }
                                                            }
                                                        })}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Adjustments */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-surface-0 rounded-xl border border-surface-3 p-5 space-y-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold text-ink-primary uppercase tracking-widest flex items-center gap-2">
                                    <Plus size={16} className="text-emerald-500" /> Bonuses
                                </h3>
                                <button type="button" onClick={addBonus} className="text-[11px] font-bold text-brand-600 hover:text-brand-700 uppercase tracking-wider transition-colors">
                                    + Add Item
                                </button>
                            </div>
                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                                {formData.bonuses.length === 0 ? (
                                    <p className="text-[10px] text-ink-disabled italic text-center py-4">No bonuses added</p>
                                ) : formData.bonuses.map((bonus, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            placeholder="Description"
                                            className="flex-1 input-premium py-1.5 text-xs"
                                            value={bonus.description}
                                            onChange={(e) => {
                                                const newB = [...formData.bonuses];
                                                newB[i].description = e.target.value;
                                                setFormData({ ...formData, bonuses: newB });
                                            }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Amt"
                                            className="w-20 input-premium py-1.5 text-xs text-emerald-600 font-bold"
                                            value={bonus.amount}
                                            onChange={(e) => {
                                                const newB = [...formData.bonuses];
                                                newB[i].amount = e.target.value;
                                                setFormData({ ...formData, bonuses: newB });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-surface-0 rounded-xl border border-surface-3 p-5 space-y-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold text-ink-primary uppercase tracking-widest flex items-center gap-2">
                                    <X size={16} className="text-red-500" /> Deductions
                                </h3>
                                <button type="button" onClick={addDeduction} className="text-[11px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wider transition-colors">
                                    + Add Item
                                </button>
                            </div>
                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                                {formData.deductions.length === 0 ? (
                                    <p className="text-[10px] text-ink-disabled italic text-center py-4">No deductions added</p>
                                ) : formData.deductions.map((ded, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            placeholder="Reason"
                                            className="flex-1 input-premium py-1.5 text-xs"
                                            value={ded.description}
                                            onChange={(e) => {
                                                const newD = [...formData.deductions];
                                                newD[i].description = e.target.value;
                                                setFormData({ ...formData, deductions: newD });
                                            }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Amt"
                                            className="w-20 input-premium py-1.5 text-xs text-rose-600 font-bold"
                                            value={ded.amount}
                                            onChange={(e) => {
                                                const newD = [...formData.deductions];
                                                newD[i].amount = e.target.value;
                                                setFormData({ ...formData, deductions: newD });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="bg-surface-1 px-8 py-5 border-t border-surface-3 shrink-0">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center">
                            <div>
                                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Total Payout</p>
                                <p className="text-2xl font-black text-brand-600 mt-0.5">
                                    ${Number(formData.totalAmount).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary px-8"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary px-10 shadow-brand"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <><Save size={18} /> Save Payroll</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
