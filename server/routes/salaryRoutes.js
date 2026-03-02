const express = require("express");
const router = express.Router();
const {
    getSalaries,
    addSalary,
    updateSalary,
    getSalarySummary,
    exportSalariesExcel
} = require("../controllers/salaryController");
const { protect } = require("../middleware/auth.middleware");

// All routes are protected by the unlock mechanism
router.use(protect);

router.get("/", getSalaries);
router.post("/", addSalary);
router.put("/:id", updateSalary);
router.get("/summary", getSalarySummary);
router.get("/export", exportSalariesExcel);

module.exports = router;
