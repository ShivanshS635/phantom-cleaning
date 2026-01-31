/**
 * Unit Tests for Expense API Service
 * 
 * Tests expense API service functions.
 */

// Mock axios first to avoid ESM import issues
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn()
      }
    }
  }))
}));

// Mock the axios module
// Mock the axios module
jest.mock('../../api/axios', () => {
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn()
    }
  };
});

import { expenseApi } from '../../api/expense';
import api from '../../api/axios';

describe('Expense API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getExpenses', () => {
    it('should call GET /expenses with params', () => {
      const params = { category: 'Supplies', page: 1 };
      expenseApi.getExpenses(params);

      expect(api.get).toHaveBeenCalledWith('/expenses', { params });
    });
  });

  describe('getExpenseById', () => {
    it('should call GET /expenses/:id', () => {
      const id = '507f1f77bcf86cd799439011';
      expenseApi.getExpenseById(id);

      expect(api.get).toHaveBeenCalledWith(`/expenses/${id}`);
    });
  });

  describe('addExpense', () => {
    it('should call POST /expenses with data', () => {
      const data = { title: 'Test Expense', amount: 100 };
      expenseApi.addExpense(data);

      expect(api.post).toHaveBeenCalledWith('/expenses', data);
    });
  });

  describe('updateExpense', () => {
    it('should call PUT /expenses/:id with data', () => {
      const id = '507f1f77bcf86cd799439011';
      const data = { title: 'Updated Expense' };
      expenseApi.updateExpense(id, data);

      expect(api.put).toHaveBeenCalledWith(`/expenses/${id}`, data);
    });
  });

  describe('deleteExpense', () => {
    it('should call DELETE /expenses/:id', () => {
      const id = '507f1f77bcf86cd799439011';
      expenseApi.deleteExpense(id);

      expect(api.delete).toHaveBeenCalledWith(`/expenses/${id}`);
    });
  });

  describe('bulkDeleteExpenses', () => {
    it('should call DELETE /expenses with ids in body', () => {
      const ids = ['id1', 'id2', 'id3'];
      expenseApi.bulkDeleteExpenses(ids);

      expect(api.delete).toHaveBeenCalledWith('/expenses', { data: { ids } });
    });
  });

  describe('getExpenseSummary', () => {
    it('should call GET /expenses/stats/summary with params', () => {
      const params = { startDate: '2026-01-01', endDate: '2026-01-31' };
      expenseApi.getExpenseSummary(params);

      expect(api.get).toHaveBeenCalledWith('/expenses/stats/summary', { params });
    });
  });

  describe('updateExpenseStatus', () => {
    it('should call PATCH /expenses/:id/status with status', () => {
      const id = '507f1f77bcf86cd799439011';
      const status = 'Paid';
      expenseApi.updateExpenseStatus(id, status);

      expect(api.patch).toHaveBeenCalledWith(`/expenses/${id}/status`, { status });
    });
  });
});
