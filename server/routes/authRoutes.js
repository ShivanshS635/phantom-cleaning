const router = require("express").Router();
const { login } = require("../controllers/authController");
const { protect } = require("../middleware/auth.middleware");

// Standard auth (single unlock password mechanism)
router.post("/login", login);

router.get("/test", (req, res) => {
  res.send("Auth route working");
});
router.get("/me", protect, (req, res) => {
  res.json({ name: "Admin", role: req.user.role });
});

module.exports = router;