const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { downloadMonthlyReport } = require("../controllers/reportController");

router.get("/monthly", protect, adminOnly, downloadMonthlyReport);

module.exports = router;