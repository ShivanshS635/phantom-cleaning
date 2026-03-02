import React from 'react';
import { Clock, CheckCircle2, DollarSign } from 'lucide-react';

export default function SalarySummaryCards({ summary, loading }) {
    const cards = [
        {
            label: "Total Payroll",
            value: `$${summary.totalPayroll?.toLocaleString()}`,
            sub: `${summary.count} entries`,
            icon: DollarSign,
            color: "text-brand-400",
            bg: "bg-brand-400/10",
            border: "border-brand-400/20"
        },
        {
            label: "Paid Salaries",
            value: `$${summary.paidAmount?.toLocaleString()}`,
            sub: "Processed successfully",
            icon: CheckCircle2,
            color: "text-green-400",
            bg: "bg-green-400/10",
            border: "border-green-400/20"
        },
        {
            label: "Pending Payment",
            value: `$${summary.pendingAmount?.toLocaleString()}`,
            sub: "Needs your attention",
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map((card, i) => (
                <div key={i} className={`glass rounded-2xl p-5 border ${card.border} relative overflow-hidden group hover:scale-[1.02] transition-all`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</p>
                            <h3 className={`text-2xl font-bold mt-1 ${card.color}`}>
                                {loading ? <div className="h-8 w-24 bg-white/5 animate-pulse rounded" /> : card.value}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${card.bg}`}>
                            <card.icon size={20} className={card.color} />
                        </div>
                    </div>
                    {/* Subtle Glow */}
                    <div className={`absolute -bottom-6 -right-6 w-24 h-24 blur-3xl opacity-20 rounded-full ${card.bg}`} />
                </div>
            ))}
        </div>
    );
}
