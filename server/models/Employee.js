const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },

  phone: { type: String, required: true },

  email: { type: String, unique: true },

  role: {
    type: String,
    enum: ["Cleaner", "Manager", "HR"],
    required: true
  },

  city: String,

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
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);