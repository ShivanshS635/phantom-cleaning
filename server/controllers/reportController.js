const ExcelJS = require("exceljs");
const Job = require("../models/Job");
const Expense = require("../models/Expense");

const STATES = ["Sydney", "Melbourne", "Adelaide", "Perth", "Brisbane"];

function getWeekOfMonth(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const adjusted = date.getDate() + firstDay.getDay();
  return Math.ceil(adjusted / 7);
}

exports.downloadMonthlyReport = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    if (!month) {
      return res.status(400).json({ message: "Month is required (YYYY-MM)" });
    }

    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const jobs = await Job.find({
      date: { $gte: start.toISOString().slice(0, 10), $lt: end.toISOString().slice(0, 10) }
    }).populate("assignedEmployee", "name");

    const expenses = await Expense.find({
      date: { $gte: start, $lt: end }
    });

    const workbook = new ExcelJS.Workbook();

    /* =====================
       JOB SHEETS (BY STATE)
    ===================== */
    STATES.forEach(state => {
      const sheet = workbook.addWorksheet(state);
      sheet.columns = [
        { header: "Job ID", key: "id", width: 26 },
        { header: "Date", key: "date", width: 14 },
        { header: "Week", key: "week", width: 10 },
        { header: "Customer", key: "customer", width: 22 },
        { header: "Cleaner", key: "cleaner", width: 22 },
        { header: "Status", key: "status", width: 14 },
        { header: "Price", key: "price", width: 12 }
      ];

      jobs
        .filter(j => j.state === state)
        .forEach(job => {
          const d = new Date(job.date);
          sheet.addRow({
            id: job._id.toString(),
            date: d.toLocaleDateString(),
            week: `Week ${getWeekOfMonth(d)}`,
            customer: job.customerName,
            cleaner: job.assignedEmployee?.name || "Unassigned",
            status: job.status,
            price: Number(job.price || 0)
          });
        });
    });

    /* =====================
       EXPENSES SHEET
    ===================== */
    const expenseSheet = workbook.addWorksheet("Expenses");
    expenseSheet.columns = [
      { header: "Title", key: "title", width: 24 },
      { header: "Amount", key: "amount", width: 14 },
      { header: "Date", key: "date", width: 16 }
    ];

    expenses.forEach(e => {
      expenseSheet.addRow({
        title: e.title,
        amount: Number(e.amount),
        date: new Date(e.date).toLocaleDateString()
      });
    });

    /* =====================
       SUMMARY SHEET
    ===================== */
    const summary = workbook.addWorksheet("Summary");

    const totalRevenue = jobs
      .filter(j => j.status === "Completed")
      .reduce((s, j) => s + Number(j.price || 0), 0);

    const totalExpenses = expenses.reduce(
      (s, e) => s + Number(e.amount || 0), 0
    );

    summary.addRows([
      ["Total Revenue", totalRevenue],
      ["Total Expenses", totalExpenses],
      ["Net Revenue", totalRevenue - totalExpenses]
    ]);

    /* =====================
       SEND FILE
    ===================== */
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=PhantomCleaning_${month}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Excel generation failed" });
  }
};