import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Clock,
  AlertTriangle,
} from "lucide-react";

const STAT_CONFIGS = [
  {
    key: "revenue",
    title: "Total Revenue",
    format: (v) => `$${v.toLocaleString()}`,
    icon: DollarSign,
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    key: "profit",
    title: "Net Profit",
    format: (v, s) => `$${v.toLocaleString()}`,
    icon: TrendingUp,
    gradient: "from-brand-500 to-blue-500",
    bg: "bg-brand-50",
    border: "border-brand-100",
    suffix: (v, s) => s.revenue > 0 ? `${((v / s.revenue) * 100).toFixed(1)}% margin` : null,
  },
  {
    key: "totalJobs",
    title: "Total Jobs",
    icon: Calendar,
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
    subtitle: (s) => `${s.completedJobs} completed`,
  },
  {
    key: "todayJobs",
    title: "Today's Jobs",
    icon: Clock,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    key: "activeCleaners",
    title: "Active Cleaners",
    format: (v, s) => `${v}/${s.totalCleaners}`,
    icon: Users,
    gradient: "from-purple-500 to-violet-500",
    bg: "bg-purple-50",
    border: "border-purple-100",
    subtitle: (s) => `${s.totalCleaners} on team`,
  },
  {
    key: "pendingJobs",
    title: "Pending Jobs",
    icon: AlertTriangle,
    gradient: "from-rose-500 to-red-500",
    bg: "bg-rose-50",
    border: "border-rose-100",
    badge: (v) => v > 5 ? { label: "High", color: "bg-rose-100 text-rose-700" }
      : { label: "Normal", color: "bg-green-100 text-green-700" },
  },
];

export default function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {STAT_CONFIGS.map((cfg) => {
        const raw = stats[cfg.key] ?? 0;
        const value = cfg.format ? cfg.format(raw, stats) : raw;
        const subtitle = cfg.subtitle ? cfg.subtitle(stats) : null;
        const suffix = cfg.suffix ? cfg.suffix(raw, stats) : null;
        const badge = cfg.badge ? cfg.badge(raw) : null;

        return (
          <div
            key={cfg.key}
            className={`stat-card border ${cfg.border} animate-fade-up`}
          >
            {/* Top row: gradient icon + badge */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-sm`}>
                <cfg.icon size={18} className="text-white" />
              </div>
              {badge && (
                <span className={`badge ${badge.color}`}>
                  {badge.label}
                </span>
              )}
            </div>

            {/* Metric */}
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">{cfg.title}</p>
            <p className="text-2xl font-bold text-ink-primary">{value}</p>

            {/* Sub-info */}
            {(subtitle || suffix) && (
              <p className="text-xs text-ink-muted mt-1.5">{subtitle || suffix}</p>
            )}

            {/* Bottom accent bar */}
            <div className={`mt-4 h-0.5 rounded-full bg-gradient-to-r ${cfg.gradient} opacity-30`} />
          </div>
        );
      })}
    </div>
  );
}