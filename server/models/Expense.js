const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: [0, "Amount cannot be negative"]
    },
    date: {
      type: Date,
      required: [true, "Expense date is required"],
      default: Date.now
    },
    category: {
      type: String,
      enum: [
        "Supplies",
        "Equipment",
        "Travel",
        "Marketing",
        "Office",
        "Software",
        "Services",
        "Training",
        "Salary",
        "Other"
      ],
      default: "Other"
    },
    state: {
      type: String,
      enum: ["Sydney", "Melbourne", "Brisbane", "Adelaide", "Perth"],
      default: "Sydney"
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"]
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Reimbursed", "Cancelled"],
      default: "Pending"
    },
    receipt: {
      type: String, // URL to the uploaded receipt
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Credit Card", "Bank Transfer", "PayPal", "Other"],
      default: "Credit Card"
    },
    vendor: {
      type: String,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    approvedAt: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for better query performance
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ createdBy: 1 });

// Virtual for formatted date
expenseSchema.virtual('formattedDate').get(function () {
  return this.date.toISOString().split('T')[0];
});

// Instance method to mark as paid
expenseSchema.methods.markAsPaid = function (userId) {
  this.status = "Paid";
  this.approvedBy = userId;
  this.approvedAt = new Date();
  return this.save();
};

// Static method to get total expenses for a period
expenseSchema.statics.getTotalByPeriod = async function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
        status: { $ne: "Cancelled" }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get expenses by category
expenseSchema.statics.getByCategory = async function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
        status: { $ne: "Cancelled" }
      }
    },
    {
      $group: {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
};

module.exports = mongoose.model("Expense", expenseSchema);