const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { getTasksByDate, updateTaskStatus } = require("../controllers/task.controller");

router.get("/", protect, getTasksByDate);
router.put("/:id/status", protect, updateTaskStatus);

module.exports = router;