const router = require("express").Router();
const { getExpenses, addExpense } = require("../controllers/expenseController");
const auth = require("../middleware/auth");
const {adminOnly} = require("../middleware/adminMiddleware");

router.get("/", auth, adminOnly, getExpenses);
router.post("/", auth, adminOnly, addExpense);

module.exports = router;