const Expense = require("../models/Expense");

exports.getExpenses = async (req, res) => {
  const expenses = await Expense.find().sort({ date: -1 });
  res.json(expenses);
};

exports.addExpense = async (req, res) => {
  const { title, amount, date, note } = req.body;

  const expense = await Expense.create({
    title,
    amount,
    date,
    note,
    createdBy: req.user.id // admin
  });

  res.status(201).json(expense);
};