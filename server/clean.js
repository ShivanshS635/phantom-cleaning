// cleanupExpenseDates.js - Run this once to fix date issues
const mongoose = require("mongoose");
const Expense = require("./models/Expense");

async function cleanupExpenseDates() {
  try {
    await mongoose.connect("mongodb+srv://shivansh3375:060305Ss@cluster0.atw15ey.mongodb.net/?appName=Cluster0");

    console.log("Connected to MongoDB");

    // Find all expenses
    const expenses = await Expense.find({});
    console.log(`Found ${expenses.length} expenses`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const expense of expenses) {
      try {
        // Check if date is already a valid Date object
        if (expense.date instanceof Date && !isNaN(expense.date)) {
          skippedCount++;
          continue;
        }

        // Try to parse the date if it's a string
        let newDate;
        if (typeof expense.date === "string") {
          newDate = new Date(expense.date);
        } else if (expense.date) {
          // If it's something else, try to convert it
          newDate = new Date(expense.date);
        } else {
          // If no date, use current date
          newDate = new Date();
        }

        // Check if the parsed date is valid
        if (isNaN(newDate.getTime())) {
          console.log(`Invalid date for expense ${expense._id}: ${expense.date}`);
          // Set to current date as fallback
          newDate = new Date();
        }

        // Update the expense
        expense.date = newDate;
        await expense.save();
        updatedCount++;
        
        console.log(`Updated expense ${expense._id}: ${expense.date}`);
      } catch (err) {
        console.error(`Error updating expense ${expense._id}:`, err.message);
      }
    }

    console.log(`Cleanup completed. Updated: ${updatedCount}, Skipped: ${skippedCount}`);
    process.exit(0);
  } catch (error) {
    console.error("Cleanup error:", error);
    process.exit(1);
  }
}

cleanupExpenseDates();