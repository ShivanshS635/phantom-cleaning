const jwt = require("jsonwebtoken");

const signToken = () =>
  jwt.sign(
    { role: "Admin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

exports.login = async (req, res) => {
  try {
    const { password } = req.body;

    const adminPassword = process.env.LOGIN_PASSWORD;
    if (!adminPassword) {
      console.error("ADMIN_PANEL_PASSWORD is not set in the environment variables!");
      return res.status(500).json({ message: "Server misconfiguration. Please contact support." });
    }

    if (password !== adminPassword) {
      return res.status(401).json({ message: "Incorrect unlock code" });
    }

    // 4. Sign and return the JWT directly without hitting a database
    const token = signToken();

    res.json({
      token,
      user: {
        name: "Admin",
        role: "Admin",
      },
    });
  } catch (err) {
    console.error("Login Error: ", err);
    res.status(500).json({ message: "Unlock failed. Please try again later." });
  }
};
