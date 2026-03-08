import React from 'react';
import { Clock, CheckCircle2, DollarSign } from 'lucide-react';

const CARD_CONFIGS = [
    {
        key: "totalPayroll",
        title: "Total Payroll",
        icon: DollarSign,
        gradient: "from-brand-500 to-indigo-500",
        bg: "bg-brand-50",
        border: "border-brand-100",
        format: (v) => `$${v?.toLocaleString()}`
    },
    {
        key: "paidAmount",
        title: "Paid Salaries",
        icon: CheckCircle2,
        gradient: "from-emerald-500 to-teal-500",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        format: (v) => `$${v?.toLocaleString()}`
    },
    {
        key: "pendingAmount",
        title: "Pending Payment",
        icon: Clock,
        gradient: "from-amber-500 to-orange-500",
        bg: "bg-amber-50",
        border: "border-amber-100",
        format: (v) => `$${v?.toLocaleString()}`
    }
];

export default function SalarySummaryCards({ summary, loading }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CARD_CONFIGS.map((cfg) => {
                const value = summary[cfg.key] || 0;
                return (
                    <div
                        key={cfg.key}
                        className={`stat-card border ${cfg.border} animate-fade-up`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-sm`}>
                                <cfg.icon size={18} className="text-white" />
                            </div>
                        </div>

                        <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">{cfg.title}</p>
                        <h3 className="text-2xl font-bold text-ink-primary">
                            {loading ? <div className="h-8 w-24 bg-surface-2 animate-pulse rounded" /> : cfg.format(value)}
                        </h3>

                        <p className="text-xs text-ink-muted mt-1.5">
                            {cfg.key === 'totalPayroll' ? `${summary.count || 0} entries this year` :
                                cfg.key === 'paidAmount' ? 'Processed successfully' : 'Awaiting payment'}
                        </p>

                        <div className={`mt-4 h-0.5 rounded-full bg-gradient-to-r ${cfg.gradient} opacity-20`} />
                    </div>
                );
            })}
        </div>
    );
}
