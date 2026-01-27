const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");

const {
  addJob,
  getJobs,
  updateJobStatus,
  assignCleaner
} = require("../controllers/jobController");

router.use(protect);

router.post("/", addJob);
router.get("/", getJobs);
router.put("/:id/status", updateJobStatus);
router.put("/:id/assign", assignCleaner);


module.exports = router;
