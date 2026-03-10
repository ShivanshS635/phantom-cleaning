const Salary = require("../models/Salary");
const Employee = require("../models/Employee");
const mongoose = require("mongoose");
const ExcelJS = require("exceljs");



exports.getSalaries = async (req, res) => {

    try {
        const { state, month, year, status, search, page = 1, limit = 50 } = req.query;
        let filter = {};

        if (state && state !== "all") filter.state = state;
        if (status && status !== "all") filter.status = status;

        // If searching by name, we need to find employee IDs first
        if (search) {
            const employees = await Employee.find({ name: { $regex: search, $options: 'i' } }).select('_id');
            const employeeIds = employees.map(e => e._id);
            filter.employee = { $in: employeeIds };
        }

        if (month && year) {
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0, 23, 59, 59);
            filter.weekStartDate = { $gte: startOfMonth, $lte: endOfMonth };
        } else if (year) {
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year, 11, 31, 23, 59, 59);
            filter.weekStartDate = { $gte: startOfYear, $lte: endOfYear };
        }

        const salaries = await Salary.find(filter)
            .populate("employee", "name role")
            .sort({ weekStartDate: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        const total = await Salary.countDocuments(filter);

        res.json({
            success: true,
            data: salaries,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch salaries", error: err.message });
    }
};

exports.addSalary = async (req, res) => {

    try {
        const salaryData = req.body;

        // Calculate total amount if not provided
        if (!salaryData.totalAmount) {
            const bonusTotal = (salaryData.bonuses || []).reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
            const deductionTotal = (salaryData.deductions || []).reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

            let dailyAmountTotal = 0;
            let totalHours = 0;

            if (salaryData.dailyBreakdown) {
                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                days.forEach(day => {
                    const dayData = salaryData.dailyBreakdown[day];
                    if (dayData) {
                        dailyAmountTotal += (Number(dayData.amount) || 0);
                        totalHours += (Number(dayData.hours) || 0);
                    }
                });
            }

            salaryData.weeklyTotals = {
                totalHours: totalHours,
                totalDailyAmount: dailyAmountTotal
            };

            salaryData.totalAmount = (Number(salaryData.baseSalary) || 0) + dailyAmountTotal + bonusTotal - deductionTotal;
        }

        const salary = await Salary.create(salaryData);
        res.status(201).json({ success: true, data: salary });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Salary already exists for this employee in this week." });
        }
        res.status(500).json({ message: "Failed to add salary", error: err.message });
    }
};

exports.updateSalary = async (req, res) => {

    try {
        const salary = await Salary.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!salary) return res.status(404).json({ message: "Salary record not found" });
        res.json({ success: true, data: salary });
    } catch (err) {
        res.status(500).json({ message: "Failed to update salary", error: err.message });
    }
};

exports.getSalarySummary = async (req, res) => {

    try {
        const { state, year = new Date().getFullYear() } = req.query;
        let match = { year: Number(year) };
        if (state && state !== "all") match.state = state;

        const summary = await Salary.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalPayroll: { $sum: "$totalAmount" },
                    paidAmount: {
                        $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$totalAmount", 0] }
                    },
                    pendingAmount: {
                        $sum: { $cond: [{ $eq: ["$status", "Unpaid"] }, "$totalAmount", 0] }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const stateBreakdown = await Salary.aggregate([
            { $match: { year: Number(year) } },
            {
                $group: {
                    _id: "$state",
                    total: { $sum: "$totalAmount" }
                }
            }
        ]);

        res.json({
            success: true,
            summary: summary[0] || { totalPayroll: 0, paidAmount: 0, pendingAmount: 0, count: 0 },
            stateBreakdown
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to get summary", error: err.message });
    }
};

exports.exportSalariesExcel = async (req, res) => {

    try {
        const { state, year } = req.query;
        let filter = {};
        if (state && state !== "all") filter.state = state;
        if (year) filter.year = Number(year);

        const salaries = await Salary.find(filter).populate("employee", "name role").lean();

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Payroll");

        sheet.columns = [
            { header: "Employee", key: "employeeName", width: 25 },
            { header: "State", key: "state", width: 15 },
            { header: "Week", key: "week", width: 10 },
            { header: "Base Salary", key: "base", width: 15 },
            { header: "Total Amount", key: "total", width: 15 },
            { header: "Status", key: "status", width: 12 },
            { header: "Payment Ref", key: "ref", width: 20 }
        ];

        salaries.forEach(s => {
            sheet.addRow({
                employeeName: s.employee?.name || "N/A",
                state: s.state,
                week: `W${s.weekNumber}-${s.year}`,
                base: s.baseSalary,
                total: s.totalAmount,
                status: s.status,
                ref: s.paymentReference || ""
            });
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="Payroll_${year || 'ALL'}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ message: "Export failed", error: err.message });
    }
};
