// api/expense.js - API service file
import api from "./axios";

export const expenseApi = {
  // Get expenses with filters
  getExpenses: (params) => api.get("/expenses", { params }),
  
  // Get expense by ID
  getExpenseById: (id) => api.get(`/expenses/${id}`),
  
  // Add new expense
  addExpense: (data) => api.post("/expenses", data),
  
  // Update expense
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  
  // Delete expense
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  
  // Bulk delete expenses
  bulkDeleteExpenses: (ids) => api.delete("/expenses", { data: { ids } }),
  
  // Get expense summary/stats
  getExpenseSummary: (params) => api.get("/expenses/stats/summary", { params }),
  
  // Update expense status
  updateExpenseStatus: (id, status) => 
    api.patch(`/expenses/${id}/status`, { status })
};