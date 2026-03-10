import React from 'react';
import { X, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function SalaryDetailDialog({ salary, onClose }) {
    if (!salary) return null;

    //const dailyTotal = DAYS.reduce((sum, d) => sum + (salary.dailyBreakdown?.[d]?.amount || 0), 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-0 w-full max-w-xl flex flex-col rounded-2xl border border-surface-3 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-surface-3 bg-surface-1 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center text-brand-700 font-bold text-base">
                            {salary.employee?.name?.[0] || 'E'}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-ink-primary">{salary.employee?.name || 'Unknown'}</h2>
                            <p className="text-[10px] text-ink-muted uppercase tracking-widest">{salary.employee?.role || 'Staff'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface-2 rounded-xl text-ink-muted transition-all">
                        <X size={18} />
                    </button>
                </div>

                {/* Meta info */}
                <div className="px-6 py-3 bg-surface-1/50 border-b border-surface-3 flex items-center gap-6 text-xs text-ink-secondary flex-wrap">
                    <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-brand-600" />
                        {new Date(salary.weekStartDate).toLocaleDateString()} – {new Date(salary.weekEndDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-brand-600" />
                        {salary.state}
                    </span>
                    <span className={`badge font-bold ${salary.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {salary.status === 'Paid' ? <CheckCircle size={11} /> : <Clock size={11} />}
                        {salary.status}
                    </span>
                </div>

                {/* Daily Breakdown */}
                <div className="p-6 space-y-3 flex-1 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-4 w-1 bg-brand-600 rounded-full" />
                        <h3 className="text-xs font-bold text-ink-primary uppercase tracking-widest">Daily Commission Breakdown</h3>
                    </div>

                    <div className="bg-surface-0 rounded-xl border border-surface-3 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-surface-1 border-b border-surface-3">
                                <tr>
                                    <th className="py-2.5 px-5 text-[10px] font-bold text-ink-muted uppercase tracking-widest text-left">Day</th>
                                    <th className="py-2.5 px-5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest text-right">Commission</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-3">
                                {DAYS.map(day => {
                                    const amount = salary.dailyBreakdown?.[day]?.amount || 0;
                                    return (
                                        <tr key={day} className={`${amount > 0 ? '' : 'opacity-40'}`}>
                                            <td className="py-3 px-5 text-sm font-medium text-ink-secondary capitalize">{day}</td>
                                            <td className={`py-3 px-5 text-sm font-bold text-right ${amount > 0 ? 'text-emerald-700' : 'text-ink-muted'}`}>
                                                {amount > 0 ? `$${amount.toLocaleString()}` : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="mt-4 bg-surface-1 rounded-xl border border-surface-3 divide-y divide-surface-3">
                        {salary.baseSalary > 0 && (
                            <div className="flex justify-between items-center px-5 py-3 text-sm">
                                <span className="text-ink-secondary font-medium">Base Pay</span>
                                <span className="text-ink-primary font-bold">${salary.baseSalary.toLocaleString()}</span>
                            </div>
                        )}
                        {(salary.bonuses || []).map((b, i) => (
                            <div key={i} className="flex justify-between items-center px-5 py-3 text-sm">
                                <span className="text-ink-secondary font-medium">Bonus: {b.description}</span>
                                <span className="text-emerald-600 font-bold">+${Number(b.amount).toLocaleString()}</span>
                            </div>
                        ))}
                        {(salary.deductions || []).map((d, i) => (
                            <div key={i} className="flex justify-between items-center px-5 py-3 text-sm">
                                <span className="text-ink-secondary font-medium">Deduction: {d.description}</span>
                                <span className="text-red-500 font-bold">-${Number(d.amount).toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center px-5 py-3.5 bg-brand-600/5 rounded-b-xl">
                            <span className="text-sm font-bold text-ink-primary">Total Payout</span>
                            <span className="text-xl font-black text-brand-600">${salary.totalAmount?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
