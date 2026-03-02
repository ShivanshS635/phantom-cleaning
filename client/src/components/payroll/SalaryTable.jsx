import React from 'react';
import { Edit3, CheckCircle, Clock } from 'lucide-react';
import api from '../../api/axios';
import { showSuccess, showError } from '../../utils/toast';

export default function SalaryTable({ salaries, loading, refresh }) {
    const handleMarkAsPaid = async (id) => {
        try {
            await api.put(`/salary/${id}`, { status: 'Paid', paidAt: new Date() });
            showSuccess("Salary marked as paid");
            refresh();
        } catch (err) {
            showError("Update failed");
        }
    };

    if (loading) return (
        <div className="glass rounded-2xl border border-white/8 h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
    );

    return (
        <div className="glass rounded-2xl border border-white/8 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/2">
                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Period</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">State</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {salaries.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">No records found</td>
                            </tr>
                        ) : salaries.map((s) => (
                            <tr key={s._id} className="hover:bg-white/2 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold text-xs">
                                            {s.employee?.name?.[0] || 'E'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{s.employee?.name || 'Unknown'}</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">{s.employee?.role || 'Staff'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-slate-300">Week {s.weekNumber}</p>
                                    <p className="text-[10px] text-slate-500">{new Date(s.weekStartDate).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-brand-400">${s.totalAmount.toLocaleString()}</p>
                                    <div className="flex gap-2 items-center">
                                        <p className="text-[10px] text-slate-500">
                                            {s.weeklyTotals?.totalHours > 0 ? `${s.weeklyTotals.totalHours} hrs` : (s.baseSalary > 0 ? `$${s.baseSalary} base` : 'Dynamic')}
                                        </p>
                                        {s.weeklyTotals?.totalDailyAmount > 0 && (
                                            <p className="text-[10px] text-green-500/70 font-bold">+ ${s.weeklyTotals.totalDailyAmount}</p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-slate-400">
                                        {s.state}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${s.status === 'Paid' ? 'text-green-400' : 'text-amber-400'
                                        }`}>
                                        {s.status === 'Paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                        {s.status}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {s.status === 'Unpaid' && (
                                            <button
                                                onClick={() => handleMarkAsPaid(s._id)}
                                                className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                                                title="Mark as Paid"
                                            >
                                                <CheckCircle size={14} />
                                            </button>
                                        )}
                                        <button className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all">
                                            <Edit3 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
