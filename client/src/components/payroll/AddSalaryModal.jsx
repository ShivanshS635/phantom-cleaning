import React, { useState, useEffect } from 'react';
import { X, Save, Plus, DollarSign, Calendar, User } from 'lucide-react';
import api from '../../api/axios';
import { showSuccess, showError } from '../../utils/toast';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function AddSalaryModal({ isOpen, onClose, onSuccess }) {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        employee: '',
        state: 'Sydney',
        weekStartDate: '',
        weekEndDate: '',
        year: new Date().getFullYear(),
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
            const start = new Date(formData.weekStartDate);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);

            // Calculate week number
            const firstDayOfYear = new Date(start.getFullYear(), 0, 1);
            const pastDaysOfYear = (start - firstDayOfYear) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

            setFormData(prev => ({
                ...prev,
                weekEndDate: end.toISOString().split('T')[0],
                weekNumber: weekNum,
                year: start.getFullYear()
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
            await api.post('/salary', formData);
            showSuccess("Salary record created");
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-900 w-full max-w-5xl max-h-[95vh] flex flex-col rounded-[2rem] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Header: Solid & Compact */}
                <div className="bg-slate-800/50 px-8 py-5 border-b border-white/5 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Generate Payroll</h2>
                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Weekly Salary Entry</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    {/* Basic Info: Sleek Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/2 p-5 rounded-2xl border border-white/5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <User size={12} className="text-brand-400" /> Employee
                            </label>
                            <select
                                required
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all"
                                value={formData.employee}
                                onChange={(e) => {
                                    const emp = employees.find(x => x._id === e.target.value);
                                    setFormData({ ...formData, employee: e.target.value, state: emp?.state || 'Sydney' });
                                }}
                            >
                                <option value="" className="bg-slate-900">Select Employee</option>
                                {employees.map(e => <option key={e._id} value={e._id} className="bg-slate-900">{e.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} className="text-brand-400" /> Start Date
                            </label>
                            <input
                                type="date"
                                required
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all"
                                value={formData.weekStartDate}
                                onChange={(e) => setFormData({ ...formData, weekStartDate: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <DollarSign size={12} className="text-brand-400" /> Base Salary
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-brand-500/50"
                                    value={formData.baseSalary}
                                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Daily Breakdown: Table Structure */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="h-4 w-1 bg-brand-500 rounded-full"></div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Daily Breakdown</h3>
                        </div>

                        <div className="bg-white/2 rounded-2xl border border-white/5 overflow-hidden">
                            <table className="w-full border-collapse">
                                <thead className="bg-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                                    <tr>
                                        <th className="py-3 font-bold border-r border-white/5">Day</th>
                                        <th className="py-3 font-bold border-r border-white/5 text-blue-400">Hours</th>
                                        <th className="py-3 font-bold text-green-400">Salary Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {DAYS.map(day => (
                                        <tr key={day} className="group hover:bg-white/2 transition-colors">
                                            <td className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-r border-white/5 w-32">
                                                {day}
                                            </td>
                                            <td className="py-2 px-6 border-r border-white/5">
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    placeholder="0.0"
                                                    className="w-full bg-transparent text-center text-blue-400 text-sm font-bold focus:outline-none"
                                                    value={formData.dailyBreakdown[day].hours}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        dailyBreakdown: {
                                                            ...formData.dailyBreakdown,
                                                            [day]: { ...formData.dailyBreakdown[day], hours: e.target.value }
                                                        }
                                                    })}
                                                />
                                            </td>
                                            <td className="py-2 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-xs text-green-500/50 font-bold">$</span>
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        className="w-full bg-transparent text-center text-green-400 text-sm font-bold focus:outline-none"
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

                    {/* Adjustments: Side-by-Side Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white/2 rounded-2x border border-white/5 p-5 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Plus size={12} className="text-green-500" /> Bonuses
                                </h3>
                                <button type="button" onClick={addBonus} className="text-[10px] font-bold text-brand-400 hover:text-brand-300 uppercase tracking-wider transition-colors">
                                    + Add Item
                                </button>
                            </div>
                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                {formData.bonuses.length === 0 ? (
                                    <p className="text-[10px] text-slate-600 italic text-center py-4">No bonuses added</p>
                                ) : formData.bonuses.map((bonus, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            placeholder="Description"
                                            className="flex-1 bg-slate-800/50 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500/30"
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
                                            className="w-20 bg-slate-800/50 border border-white/5 rounded-lg px-3 py-2 text-xs text-green-400 font-bold focus:outline-none"
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

                        <div className="bg-white/2 rounded-2xl border border-white/5 p-5 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <X size={12} className="text-red-500" /> Deductions
                                </h3>
                                <button type="button" onClick={addDeduction} className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider transition-colors">
                                    + Add Item
                                </button>
                            </div>
                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                {formData.deductions.length === 0 ? (
                                    <p className="text-[10px] text-slate-600 italic text-center py-4">No deductions added</p>
                                ) : formData.deductions.map((ded, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            placeholder="Reason"
                                            className="flex-1 bg-slate-800/50 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/30"
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
                                            className="w-20 bg-slate-800/50 border border-white/5 rounded-lg px-3 py-2 text-xs text-red-400 font-bold focus:outline-none"
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

                {/* Footer: Dynamic Recap */}
                <div className="bg-slate-800/80 px-8 py-6 border-t border-white/10 shrink-0">
                    <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
                        <div className="flex gap-8">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Hours</p>
                                <p className="text-xl font-bold text-white mt-1">
                                    {DAYS.reduce((sum, d) => sum + (Number(formData.dailyBreakdown[d].hours) || 0), 0)} <span className="text-xs text-slate-500 font-normal ml-0.5">Hrs</span>
                                </p>
                            </div>
                            <div className="w-px h-10 bg-white/5"></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calculated Net</p>
                                <p className="text-xl font-bold text-white mt-1">
                                    ${formData.totalAmount.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 sm:flex-none px-8 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-sm rounded-xl transition-all border border-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50"
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
