import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const EXPENSE_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#06b6d4", "#8b5cf6"];

export default function ExpenseBreakdownChart({ expenses }) {
  const categories = {};

  expenses.forEach(expense => {
    const category = expense.category || "Uncategorized";
    categories[category] = (categories[category] || 0) + (expense.amount || 0);
  });

  const data = Object.keys(categories).map(category => ({
    name: category,
    value: categories[category]
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">Total Expenses</p>
        <p className="text-2xl font-bold text-gray-900">${total.toLocaleString()}</p>
      </div>
    </div>
  );
}