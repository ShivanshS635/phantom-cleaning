import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ExpensesPanel({ onChange }) {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: ""
  });

  const fetchExpenses = async () => {
    const res = await api.get("/expenses");
    setExpenses(res.data);
    onChange(res.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async (e) => {
    e.preventDefault();
    await api.post("/expenses", form);
    setForm({ title: "", amount: "", date: "" });
    fetchExpenses();
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4">
      <h2 className="text-xl font-semibold">💸 Misc Expenses</h2>

      <form onSubmit={addExpense} className="grid grid-cols-3 gap-3">
        <input
          placeholder="Title"
          className="border p-2 rounded"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          className="border p-2 rounded"
          value={form.amount}
          onChange={e => setForm({ ...form, amount: e.target.value })}
          required
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
          required
        />
        <button className="col-span-3 bg-black text-white py-2 rounded">
          Add Expense
        </button>
      </form>

      <ul className="space-y-2">
        {expenses.map(e => (
          <li key={e._id} className="flex justify-between text-sm">
            <span>{e.title}</span>
            <span className="font-medium text-red-600">-${e.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}