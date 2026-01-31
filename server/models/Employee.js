const mongoose = require("mongoose");

const STATES = ["Sydney", "Melbourne", "Adelaide", "Perth", "Brisbane"];

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    phone: { type: String, required: true },

    email: { type: String, unique: true },

    role: {
      type: String,
      enum: ["Cleaner", "Manager", "HR"],
      required: true
    },

    state: {
      type: String,
      enum: STATES,
      required: true
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },

    joiningDate: {
      type: Date,
      default: Date.now
    },

    notes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);