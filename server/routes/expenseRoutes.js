const router = require("express").Router();
const {
  getExpenses,
  getExpenseById,
  addExpense,
  updateExpense,
  deleteExpense,
  bulkDeleteExpenses,
  getExpenseSummary,
  updateExpenseStatus,
  exportExpensesExcel
} = require("../controllers/expenseController");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminMiddleware");

// Public routes (none)

// Protected routes (admin only)
router.get("/", auth, adminOnly, getExpenses);
router.get("/stats/summary", auth, adminOnly, getExpenseSummary);
router.get("/export/excel", auth, adminOnly, exportExpensesExcel);
router.get("/:id", auth, adminOnly, getExpenseById);
router.post("/", auth, adminOnly, addExpense);
router.put("/:id", auth, adminOnly, updateExpense);
router.delete("/:id", auth, adminOnly, deleteExpense);
router.delete("/", auth, adminOnly, bulkDeleteExpenses); // Bulk delete
router.patch("/:id/status", auth, adminOnly, updateExpenseStatus);

module.exports = router;