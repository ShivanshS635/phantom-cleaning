const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");

const {
  addJob,
  updateJobStatus,
  getJobs
} = require("../controllers/jobController");

router.use(protect);

router.post("/", addJob);
router.put("/:id/status", updateJobStatus);
router.get("/", getJobs);

module.exports = router;