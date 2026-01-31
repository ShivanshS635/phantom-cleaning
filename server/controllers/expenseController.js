const Expense = require("../models/Expense");
const mongoose = require("mongoose");

// @desc    Get all expenses with filters
// @route   GET /api/expenses
// @access  Private/Admin
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

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private/Admin
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

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private/Admin
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
      vendor
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

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private/Admin
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
      vendor
    } = req.body;

    // Check if expense exists
    let expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

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

    // If status changed to Paid, set approval info
    if (status === "Paid" && expense.status !== "Paid") {
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

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
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

// @desc    Bulk delete expenses
// @route   DELETE /api/expenses/bulk
// @access  Private/Admin
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

// @desc    Get expense statistics
// @route   GET /api/expenses/stats/summary
// @access  Private/Admin
exports.getExpenseSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = {};
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

// @desc    Update expense status
// @route   PATCH /api/expenses/:id/status
// @access  Private/Admin
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