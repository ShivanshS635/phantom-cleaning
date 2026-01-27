const Job = require("../models/Job");
const Task = require("../models/Task");
const { writeJobToExcel } = require("../utils/excelService");

// ✅ ADD JOB
exports.addJob = async (req, res) => {
  try {
    const job = await Job.create(req.body);

    if (job.assignedEmployee) {
      await Task.create({
        title: `Clean job for ${job.customerName}`,
        description: `Cleaning at ${job.address}, ${job.city}`,
        assignedTo: job.assignedEmployee,
        job: job._id,
        dueDate: new Date(job.date),
        priority: "Medium",
        status: "Pending"
      });
    }

    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ GET JOBS
exports.getJobs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const jobs = await Job.find(filter)
      .populate("assignedEmployee", "name phone role")
      .sort({ createdAt: -1 });

    res.json({
      data: jobs,
      meta: { total: jobs.length }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE STATUS (COMPLETE / REDO / CANCEL)
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["Upcoming", "Completed", "Redo", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const job = await Job.findById(req.params.id).populate("assignedEmployee");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.status = status;
    await job.save();

    const task = await Task.findOne({ job: job._id });

    if (task) {
      const taskStatusMap = {
        Upcoming: "Pending",
        Completed: "Completed",
        Redo: "Redo",
        Cancelled: "Cancelled"
      };

      task.status = taskStatusMap[status];
      await task.save();
    }

    if (status === "Completed") {
      await writeJobToExcel(job);
    }

    res.json({ message: "Status updated", job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Status update failed" });
  }
};

exports.assignCleaner = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.assignedEmployee = employeeId;
    await job.save();

    const updatedJob = await Job.findById(job._id).populate(
      "assignedEmployee",
      "name phone role"
    );

    res.json({
      message: "Cleaner updated successfully",
      data: updatedJob
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

