import React, { useState } from 'react';
import { Edit3, CheckCircle, Clock } from 'lucide-react';
import api from '../../api/axios';
import { showSuccess, showError } from '../../utils/toast';
import SalaryDetailDialog from './SalaryDetailDialog';

export default function SalaryTable({ salaries, loading, refresh, onEdit }) {
    const [selectedSalary, setSelectedSalary] = useState(null);

    const handleMarkAsPaid = async (e, id) => {
        e.stopPropagation(); // prevent row-click dialog from opening
        try {
            await api.put(`/salary/${id}`, { status: 'Paid', paidAt: new Date() });
            showSuccess("Salary marked as paid");
            refresh();
        } catch (err) {
            showError("Update failed");
        }
    };

    const handleEdit = (e, salary) => {
        e.stopPropagation(); // prevent row-click dialog from opening
        onEdit(salary);
    };

    if (loading) return (
        <div className="card h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <>
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-surface-3 bg-surface-1">
                                <th className="px-6 py-4 text-[10px] font-bold text-ink-muted uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-ink-muted uppercase tracking-wider">Period</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-ink-muted uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-ink-muted uppercase tracking-wider">State</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-ink-muted uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-ink-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-3">
                            {salaries.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-ink-disabled italic">No payroll records found</td>
                                </tr>
                            ) : salaries.map((s) => (
                                <tr
                                    key={s._id}
                                    className="table-row-hover group cursor-pointer"
                                    onClick={() => setSelectedSalary(s)}
                                    title="Click to view daily breakdown"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-brand-600/10 flex items-center justify-center text-brand-700 font-bold text-xs">
                                                {s.employee?.name?.[0] || 'E'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-ink-primary">{s.employee?.name || 'Unknown'}</p>
                                                <p className="text-[10px] text-ink-muted uppercase tracking-tight">{s.employee?.role || 'Staff'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-medium text-ink-secondary">
                                            {new Date(s.weekStartDate).toLocaleString('default', { month: 'short' })} - Week {s.weekNumber}
                                        </p>
                                        <p className="text-[10px] text-ink-muted">{new Date(s.weekStartDate).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-ink-primary">${s.totalAmount?.toLocaleString()}</p>
                                        <div className="flex gap-2 items-center">
                                            <p className="text-[10px] text-ink-muted">
                                                {s.baseSalary > 0 ? `$${s.baseSalary} base pay` : 'Commission only'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="badge bg-surface-2 text-ink-secondary font-semibold">
                                            {s.state}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`badge ${s.status === 'Paid'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-amber-50 text-amber-700'
                                            }`}>
                                            {s.status === 'Paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                            <span className="font-bold tracking-wider">{s.status.toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {s.status === 'Unpaid' && (
                                                <button
                                                    onClick={(e) => handleMarkAsPaid(e, s._id)}
                                                    className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all shadow-sm"
                                                    title="Mark as Paid"
                                                >
                                                    <CheckCircle size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleEdit(e, s)}
                                                className="p-1.5 rounded-lg bg-surface-2 text-ink-muted hover:text-ink-primary transition-all border border-surface-3"
                                                title="Edit record"
                                            >
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

            {selectedSalary && (
                <SalaryDetailDialog
                    salary={selectedSalary}
                    onClose={() => setSelectedSalary(null)}
                />
            )}
        </>
    );
}
