import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Download, Filter, Search, Calendar, Coins } from 'lucide-react';
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
        status: 'all',
        search: ''
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
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-600/10 flex items-center justify-center">
                        <Coins size={18} className="text-brand-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-ink-primary">Payroll Dashboard</h2>
                        <p className="text-sm text-ink-muted">Manage weekly salaries and financial tracking</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                        onClick={handleExport}
                        className="btn-secondary gap-2 text-sm"
                    >
                        <Download size={16} className="text-ink-muted" />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary gap-2 text-sm shadow-brand"
                    >
                        <Plus size={16} />
                        <span>Add Salary</span>
                    </button>
                </div>
            </div>

            <SalarySummaryCards summary={summary} loading={loading} />

            {/* Filters Bar */}
            <div className="card p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-surface-1 rounded-xl px-3 py-2 border border-surface-3">
                    <Filter size={15} className="text-ink-muted" />
                    <select
                        value={filters.state}
                        onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                        className="bg-transparent text-sm text-ink-secondary focus:outline-none appearance-none pr-6 cursor-pointer"
                    >
                        {STATES.map(s => <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-surface-1 rounded-xl px-3 py-2 border border-surface-3">
                    <Calendar size={15} className="text-ink-muted" />
                    <select
                        value={filters.month}
                        onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                        className="bg-transparent text-sm text-ink-secondary focus:outline-none appearance-none pr-6 cursor-pointer"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 min-w-[8px]" />

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
                    <input
                        type="text"
                        placeholder="Search employee by name..."
                        className="input-premium pl-10 py-2 text-sm"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
