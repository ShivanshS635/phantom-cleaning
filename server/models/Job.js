const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    address: String,
    city: String,

    state: {
      type: String,
      enum: ["Sydney", "Melbourne", "Adelaide", "Perth", "Brisbane"],
      required: true
    },

    date: String,
    time: String,

    areas: String,
    workType: String,
    estTime: String,

    price: { type: Number, required: true },

    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee"
    },

    status: {
      type: String,
      enum: ["Upcoming", "Completed", "Redo", "Cancelled"],
      default: "Upcoming"
    },

    notes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
