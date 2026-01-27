const bcrypt = require("bcryptjs");

exports.verifyAdminPassword = async (req, res) => {
  const { adminPassword } = req.body;

  if (!adminPassword) {
    return res.status(400).json({ message: "Admin password required" });
  }

  if (adminPassword !== process.env.ADMIN_PANEL_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin password" });
  }

  res.json({
    success: true,
    message: "Admin access granted",
    adminAccess: true
  });
};