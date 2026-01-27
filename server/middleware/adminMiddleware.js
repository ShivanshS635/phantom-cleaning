exports.adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === "Admin" || req.user.role === "SuperAdmin")) {
    next();
  } else {
    return res.status(403).json({ message: "Admin access only" });
  }
};