// ExpenseCategoryBadge.jsx — Premium pill badges with icon per category
const CATEGORY_CONFIG = {
  Supplies: { color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400" },
  Equipment: { color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-400" },
  Travel: { color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  Marketing: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  Office: { color: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-400" },
  Software: { color: "bg-brand-50 text-brand-700 border-brand-200", dot: "bg-brand-400" },
  Services: { color: "bg-pink-50 text-pink-700 border-pink-200", dot: "bg-pink-400" },
  Training: { color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-400" },
  Salary: { color: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-400" },
  Other: { color: "bg-surface-2 text-ink-secondary border-surface-3", dot: "bg-ink-disabled" },
};

export default function ExpenseCategoryBadge({ category }) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;
  return (
    <span className={`badge border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {category || "Other"}
    </span>
  );
}