const Expense = require("../models/Expense");
const mongoose = require("mongoose");
const ExcelJS = require("exceljs");

const STATES = ["Sydney", "Melbourne", "Adelaide", "Perth", "Brisbane"];

exports.getExpenses = async (req, res) => {
  try {
    const {
      category,
      status,
      startDate,
      endDate,
      search,
      sortBy = "date",
      sortOrder = "desc",
      page = 1,
      limit = 50
    } = req.query;

    // Build filter object
    let filter = {};

    // State filter
    if (req.query.state && req.query.state !== "All" && req.query.state !== "all") {
      filter.state = req.query.state;
    }

    // Category filter
    if (category && category !== "all") {
      filter.category = category;
    }

    // Status filter
    if (status && status !== "all") {
      filter.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { vendor: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    // Sort configuration
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    // Get expenses with filters
    const expenses = await Expense.find(filter)
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Expense.countDocuments(filter);

    // Get summary statistics
    const summary = await Expense.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "Pending"] }, "$amount", 0]
            }
          },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "Paid"] }, "$amount", 0]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      count: expenses.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      summary: summary[0] || {
        totalAmount: 0,
        pendingAmount: 0,
        paidAmount: 0,
        count: 0
      },
      data: expenses
    });
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
      error: error.message
    });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("createdBy", "name email phone")
      .populate("approvedBy", "name email");

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error("Get expense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expense",
      error: error.message
    });
  }
};

exports.addExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      date,
      category,
      description,
      status,
      receipt,
      paymentMethod,
      vendor,
      state
    } = req.body;

    // Validation
    if (!title || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: "Title, amount, and date are required"
      });
    }

    const expense = await Expense.create({
      title,
      amount: parseFloat(amount),
      date: new Date(date),
      category: category || "Other",
      description,
      status: status || "Pending",
      receipt,
      paymentMethod: paymentMethod || "Credit Card",
      vendor,
      state: state || "Sydney",
      createdBy: req.user.id
    });

    // Populate creator info
    await expense.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      data: expense
    });
  } catch (error) {
    console.error("Add expense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add expense",
      error: error.message
    });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      date,
      category,
      description,
      status,
      receipt,
      paymentMethod,
      vendor,
      state
    } = req.body;

    // Check if expense exists
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    // Store original status before updating
    const originalStatus = expense.status;

    // Update fields
    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (date !== undefined) expense.date = new Date(date);
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (status !== undefined) expense.status = status;
    if (receipt !== undefined) expense.receipt = receipt;
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
    if (vendor !== undefined) expense.vendor = vendor;
    if (state !== undefined) expense.state = state;

    // If status changed to Paid, set approval info
    if (status === "Paid" && originalStatus !== "Paid") {
      expense.approvedBy = req.user.id;
      expense.approvedAt = new Date();
    }

    await expense.save();

    // Populate user info
    await expense.populate("createdBy", "name email");
    await expense.populate("approvedBy", "name email");

    res.json({
      success: true,
      message: "Expense updated successfully",
      data: expense
    });
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update expense",
      error: error.message
    });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    await expense.deleteOne();

    res.json({
      success: true,
      message: "Expense deleted successfully"
    });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete expense",
      error: error.message
    });
  }
};

exports.bulkDeleteExpenses = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Expense IDs array is required"
      });
    }

    const result = await Expense.deleteMany({
      _id: { $in: ids }
    });

    res.json({
      success: true,
      message: `${result.deletedCount} expenses deleted successfully`
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete expenses",
      error: error.message
    });
  }
};

exports.getExpenseSummary = async (req, res) => {
  try {
    const { startDate, endDate, state } = req.query;

    let filter = {};
    if (state && state !== "All" && state !== "all") {
      filter.state = state;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Get total amounts by category (SIMPLE VERSION)
    const byCategory = await Expense.aggregate([
      {
        $match: {
          ...filter,
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

    // SIMPLIFIED monthly trend without date aggregation
    const monthlyTrend = await Expense.aggregate([
      {
        $match: {
          ...filter,
          status: { $ne: "Cancelled" },
          date: { $exists: true, $ne: null }
        }
      },
      {
        $addFields: {
          // Create a simple month-year string for grouping
          monthYear: {
            $cond: {
              if: { $eq: [{ $type: "$date" }, "date"] },
              then: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$date"
                }
              },
              else: {
                // If it's a string, try to extract YYYY-MM
                $substr: ["$date", 0, 7]
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$monthYear",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $limit: 6
      }
    ]);

    // Get status breakdown
    const statusBreakdown = await Expense.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get state breakdown
    const stateBreakdown = await Expense.aggregate([
      {
        $match: {
          ...filter,
          status: { $ne: "Cancelled" }
        }
      },
      {
        $group: {
          _id: "$state",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    // Calculate totals
    const totals = await Expense.aggregate([
      {
        $match: {
          ...filter,
          status: { $ne: "Cancelled" }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" }
        }
      }
    ]);

    // Format monthly trend data for frontend
    const formattedMonthlyTrend = monthlyTrend.map(item => {
      const [year, month] = item._id.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' });
      return {
        _id: { year: parseInt(year), month: parseInt(month) },
        totalAmount: item.totalAmount,
        count: item.count
      };
    }).sort((a, b) => a._id.year - b._id.year || a._id.month - b._id.month);

    res.json({
      success: true,
      data: {
        byCategory,
        monthlyTrend: formattedMonthlyTrend,
        statusBreakdown,
        stateBreakdown,
        totals: totals[0] || {
          totalAmount: 0,
          count: 0,
          avgAmount: 0
        }
      }
    });
  } catch (error) {
    console.error("Get expense summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expense summary",
      error: error.message
    });
  }
};

exports.updateExpenseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    expense.status = status;

    // If marking as paid, set approval info
    if (status === "Paid") {
      expense.approvedBy = req.user.id;
      expense.approvedAt = new Date();
    }

    await expense.save();

    res.json({
      success: true,
      message: "Expense status updated successfully",
      data: expense
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update expense status",
      error: error.message
    });
  }
};

exports.exportExpensesExcel = async (req, res) => {
  try {
    const {
      category,
      status,
      startDate,
      endDate,
      search,
      state
    } = req.query;

    // Build filter object (same as getExpenses)
    let filter = {};

    // State filter
    if (state && state !== "All" && state !== "all") {
      filter.state = state;
    }

    // Category filter
    if (category && category !== "all") {
      filter.category = category;
    }

    // Status filter
    if (status && status !== "all") {
      filter.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    // Get all expenses matching filters (no pagination for export)
    const expenses = await Expense.find(filter)
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ date: -1 });

    // Create workbook
    const wb = new ExcelJS.Workbook();

    // Create a sheet for each state
    STATES.forEach(stateName => {
      const sheet = wb.addWorksheet(stateName);
      
      // Set column headers
      sheet.columns = [
        { header: "Title", key: "title", width: 30 },
        { header: "Amount", key: "amount", width: 15 },
        { header: "Date", key: "date", width: 15 },
        { header: "Category", key: "category", width: 15 },
        { header: "Status", key: "status", width: 12 },
        { header: "Description", key: "description", width: 40 },
        { header: "Payment Method", key: "paymentMethod", width: 18 },
        { header: "Created By", key: "createdBy", width: 20 }
      ];

      // Style header row
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Filter expenses for this state
      const stateExpenses = expenses.filter(e => e.state === stateName);

      // Add rows
      stateExpenses.forEach(expense => {
        sheet.addRow({
          title: expense.title,
          amount: Number(expense.amount || 0),
          date: new Date(expense.date).toLocaleDateString('en-AU'),
          category: expense.category,
          status: expense.status,
          description: expense.description || '',
          paymentMethod: expense.paymentMethod || '',
          createdBy: expense.createdBy?.name || 'N/A'
        });
      });

      // Add summary row at the bottom
      if (stateExpenses.length > 0) {
        const totalAmount = stateExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
        const lastRow = sheet.rowCount + 1;
        sheet.getRow(lastRow).font = { bold: true };
        sheet.getCell(`B${lastRow}`).value = totalAmount;
        sheet.getCell(`A${lastRow}`).value = 'Total';
      }
    });

    // Set response headers BEFORE writing
    const dateStr = new Date().toISOString().split('T')[0];
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Expenses_${dateStr}.xlsx"`
    );

    // Write workbook to response stream
    await wb.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export expenses Excel error:", error);
    // Make sure we haven't already sent headers
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to export expenses to Excel",
        error: error.message
      });
    } else {
      // If headers already sent, we can't send JSON, so log the error
      console.error("Cannot send error response - headers already sent");
    }
  }
};