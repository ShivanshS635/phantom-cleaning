const mongoose = require("mongoose");

const STATES = ["Sydney", "Melbourne", "Adelaide", "Perth", "Brisbane"];

const salarySchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        state: {
            type: String,
            enum: STATES,
            required: true,
        },
        weekStartDate: {
            type: Date,
            required: true,
        },
        weekEndDate: {
            type: Date,
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        weekNumber: {
            type: Number,
            required: true,
        },
        dailyBreakdown: {
            monday: {
                hours: { type: Number, default: 0 },
                amount: { type: Number, default: 0 }
            },
            tuesday: {
                hours: { type: Number, default: 0 },
                amount: { type: Number, default: 0 }
            },
            wednesday: {
                hours: { type: Number, default: 0 },
                amount: { type: Number, default: 0 }
            },
            thursday: {
                hours: { type: Number, default: 0 },
                amount: { type: Number, default: 0 }
            },
            friday: {
                hours: { type: Number, default: 0 },
                amount: { type: Number, default: 0 }
            },
            saturday: {
                hours: { type: Number, default: 0 },
                amount: { type: Number, default: 0 }
            },
            sunday: {
                hours: { type: Number, default: 0 },
                amount: { type: Number, default: 0 }
            },
        },
        weeklyTotals: {
            totalHours: { type: Number, default: 0 },
            totalDailyAmount: { type: Number, default: 0 },
        },
        baseSalary: {
            type: Number,
            required: false,
            default: 0,
            min: 0,
        },
        bonuses: [
            {
                description: String,
                amount: { type: Number, default: 0 },
            }
        ],
        deductions: [
            {
                description: String,
                amount: { type: Number, default: 0 },
            }
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["Paid", "Unpaid"],
            default: "Unpaid",
        },
        paidAt: Date,
        paymentMethod: {
            type: String,
            enum: ["Bank Transfer", "Cash", "Cheque", "Other"],
            default: "Bank Transfer",
        },
        paymentReference: String,
        approvedAt: Date,
    },
    { timestamps: true }
);

// Compound unique index to prevent duplicate entries for the same employee in the same week
salarySchema.index({ employee: 1, year: 1, month: 1, weekNumber: 1 }, { unique: true });

// Performance indexes
salarySchema.index({ state: 1 });
salarySchema.index({ status: 1 });
salarySchema.index({ weekStartDate: -1 });

module.exports = mongoose.model("Salary", salarySchema);
