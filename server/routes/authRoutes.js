const router = require("express").Router();
const User = require("../models/User");
const { login, signup } = require("../controllers/authController");
const { protect } = require("../middleware/auth.middleware");

router.post("/signup", signup);
router.post("/login", login);

router.get("/test", (req, res) => {
  res.send("Auth route working");
});
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

module.exports = router;