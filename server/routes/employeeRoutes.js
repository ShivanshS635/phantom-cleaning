const express = require("express");
const router = express.Router();
const {
  addEmployee,
  getEmployees,
  getSingleEmployee,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employeeController");

router.post("/", addEmployee);
router.get("/", getEmployees);
router.get("/:id", getSingleEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;