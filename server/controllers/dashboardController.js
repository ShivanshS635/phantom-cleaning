const Job = require("../models/Job");
const Employee = require("../models/Employee");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const completedJobs = await Job.countDocuments({ status: "Completed" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayJobs = await Job.countDocuments({
      createdAt: { $gte: today }
    });

    const revenueAgg = await Job.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    const activeCleaners = await Employee.countDocuments({
      role: "Cleaner",
      status: "Active"
    });

    res.json({
      totalJobs,
      completedJobs,
      todayJobs,
      totalRevenue,
      activeCleaners
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard stats failed" });
  }
};