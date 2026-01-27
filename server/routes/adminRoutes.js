const router = require("express").Router();
const { verifyAdminPassword } = require("../controllers/adminController");
const { protect } = require("../middleware/auth.middleware");

router.post("/verify", protect, verifyAdminPassword);

module.exports = router;