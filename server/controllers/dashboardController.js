const Job = require("../models/Job");
const Employee = require("../models/Employee");
const Salary = require("../models/Salary");
const Expense = require("../models/Expense");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const completedJobs = await Job.countDocuments({ status: "Completed" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayJobs = await Job.countDocuments({
      createdAt: { $gte: today }
    });

    // 1. Calculate Gross Revenue from Completed Jobs
    const revenueAgg = await Job.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);
    const grossRevenue = revenueAgg[0]?.total || 0;

    // 2. Calculate Total Expenses
    const expenseAgg = await Expense.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpenses = expenseAgg[0]?.total || 0;

    // 3. Calculate Total Salaries
    let totalSalaries = 0;
    if (process.env.SALARY_MODULE_ENABLED === "true") {
      const salaryAgg = await Salary.aggregate([
        { $match: { status: "Paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      totalSalaries = salaryAgg[0]?.total || 0;
    }

    const netRevenue = grossRevenue - totalExpenses - totalSalaries;

    const activeCleaners = await Employee.countDocuments({
      role: "Cleaner",
      status: "Active"
    });

    res.json({
      totalJobs,
      completedJobs,
      todayJobs,
      grossRevenue,
      netRevenue,
      totalExpenses,
      totalSalaries,
      activeCleaners
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard stats failed" });
  }
};