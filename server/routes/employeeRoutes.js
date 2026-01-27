const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");

const {
  addEmployee,
  getEmployees,
  getSingleEmployee
} = require("../controllers/employeeController");

router.use(protect);

router.post("/", addEmployee);
router.get("/", getEmployees);
router.get("/:id", getSingleEmployee);

module.exports = router;