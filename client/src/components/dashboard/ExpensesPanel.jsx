import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import { showSuccess, showError } from "../../utils/toast";

export default function ExpensesPanel({ onChange }) {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: ""
  });

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data);
      onChange?.(res.data);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch expenses");
    }
  }, [onChange]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post("/expenses", form);
      showSuccess("Expense added successfully");
      setForm({ title: "", amount: "", date: "" });
      fetchExpenses();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to add expense");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4">
      <h2 className="text-xl font-semibold">💸 Misc Expenses</h2>

      <form onSubmit={addExpense} className="grid grid-cols-3 gap-3">
        <input
          placeholder="Title"
          className="border p-2 rounded"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          className="border p-2 rounded"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <button className="col-span-3 bg-black text-white py-2 rounded">
          Add Expense
        </button>
      </form>

      <ul className="space-y-2">
        {expenses.map((e) => (
          <li key={e._id} className="flex justify-between text-sm">
            <span>{e.title}</span>
            <span className="font-medium text-red-600">-${e.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
