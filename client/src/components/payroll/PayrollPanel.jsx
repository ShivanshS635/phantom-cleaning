import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Download, Filter, Search, Calendar } from 'lucide-react';
import api from '../../api/axios';
import { showError } from '../../utils/toast';
import SalarySummaryCards from './SalarySummaryCards';
import SalaryTable from './SalaryTable';
import AddSalaryModal from './AddSalaryModal';

const STATES = ["All", "Sydney", "Melbourne", "Adelaide", "Perth", "Brisbane"];

export default function PayrollPanel() {
    const [salaries, setSalaries] = useState([]);
    const [summary, setSummary] = useState({ totalPayroll: 0, paidAmount: 0, pendingAmount: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        state: 'All',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: 'all'
    });

    const fetchPayrollData = useCallback(async () => {
        try {
            setLoading(true);
            const [salariesRes, summaryRes] = await Promise.all([
                api.get('/salary', { params: filters }),
                api.get('/salary/summary', { params: { state: filters.state, year: filters.year } })
            ]);
            setSalaries(salariesRes.data.data);
            setSummary(summaryRes.data.summary);
        } catch (err) {
            showError("Failed to fetch payroll records");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchPayrollData();
    }, [fetchPayrollData]);

    const handleExport = async () => {
        try {
            const res = await api.get('/salary/export', {
                params: { state: filters.state, year: filters.year },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payroll_${filters.year}_${filters.state}.xlsx`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            showError("Export failed");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Payroll Dashboard</h2>
                    <p className="text-sm text-slate-400">Manage weekly salaries and financial tracking</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleExport}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all"
                    >
                        <Download size={18} className="text-slate-400" />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-all shadow-lg shadow-brand-600/20"
                    >
                        <Plus size={18} />
                        <span>Add Salary</span>
                    </button>
                </div>
            </div>

            <SalarySummaryCards summary={summary} loading={loading} />

            {/* Filters Bar */}
            <div className="glass rounded-2xl p-4 border border-white/8 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                    <Filter size={16} className="text-slate-500" />
                    <select
                        value={filters.state}
                        onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                        className="bg-transparent text-sm text-slate-300 focus:outline-none"
                    >
                        {STATES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                    <Calendar size={16} className="text-slate-500" />
                    <select
                        value={filters.month}
                        onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                        className="bg-transparent text-sm text-slate-300 focus:outline-none"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1} className="bg-slate-900">
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-1" />

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search employee..."
                        className="w-full bg-white/5 border border-white/8 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500/50 transition-all"
                    />
                </div>
            </div>

            <SalaryTable salaries={salaries} loading={loading} refresh={fetchPayrollData} />

            {isModalOpen && (
                <AddSalaryModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchPayrollData();
                    }}
                />
            )}
        </div>
    );
}
