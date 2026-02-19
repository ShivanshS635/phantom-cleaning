// ExpenseCategoryBadge.jsx
export default function ExpenseCategoryBadge({ category }) {
  const categoryColors = {
    Supplies: "bg-blue-100 text-blue-700 border-blue-200",
    Equipment: "bg-purple-100 text-purple-700 border-purple-200",
    Travel: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Marketing: "bg-green-100 text-green-700 border-green-200",
    Office: "bg-red-100 text-red-700 border-red-200",
    Software: "bg-indigo-100 text-indigo-700 border-indigo-200",
    Services: "bg-pink-100 text-pink-700 border-pink-200",
    Training: "bg-orange-100 text-orange-700 border-orange-200",
    Salary: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Other: "bg-gray-100 text-gray-700 border-gray-200"
  };

  const colorClass = categoryColors[category] || categoryColors.Other;

  return (
    <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full border ${colorClass}`}>
      {category}
    </span>
  );
}