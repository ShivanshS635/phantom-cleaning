/**
 * Unit Tests for Expense Controller
 * 
 * Tests expense controller functions with filters, pagination, and aggregations.
 */

const {
  getExpenses,
  getExpenseById,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} = require('../../../controllers/expenseController');
const Expense = require('../../../models/Expense');
const User = require('../../../models/User');

describe('Expense Controller', () => {
  let testUser;

  beforeEach(async () => {
    await Expense.deleteMany({});
    await User.deleteMany({});

    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword123',
      role: 'Admin'
    });
  });

  describe('addExpense', () => {
    it('should create expense with required fields', async () => {
      const req = {
        body: {
          title: 'Test Expense',
          amount: 100,
          date: '2026-02-15'
        },
        user: { id: testUser._id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await addExpense(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();

      const expense = await Expense.findOne({ title: 'Test Expense' });
      expect(expense).toBeDefined();
      expect(expense.amount).toBe(100);
      expect(expense.createdBy.toString()).toBe(testUser._id.toString());
    });

    it('should return 400 when required fields are missing', async () => {
      const req = {
        body: {
          title: 'Test Expense'
          // Missing amount and date
        },
        user: { id: testUser._id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await addExpense(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Title, amount, and date are required'
      });
    });
  });

  describe('getExpenses', () => {
    beforeEach(async () => {
      // Create test expenses
      await Expense.create([
        {
          title: 'Expense 1',
          amount: 100,
          date: new Date('2026-01-15'),
          category: 'Supplies',
          status: 'Paid',
          createdBy: testUser._id
        },
        {
          title: 'Expense 2',
          amount: 200,
          date: new Date('2026-01-20'),
          category: 'Equipment',
          status: 'Pending',
          createdBy: testUser._id
        },
        {
          title: 'Expense 3',
          amount: 150,
          date: new Date('2026-02-15'),
          category: 'Supplies',
          status: 'Paid',
          createdBy: testUser._id
        }
      ]);
    });

    it('should return all expenses when no filters', async () => {
      const req = { query: {} };
      const res = { json: jest.fn() };

      await getExpenses(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(3);
      expect(response.total).toBe(3);
    });

    it('should filter by category', async () => {
      const req = {
        query: { category: 'Supplies' }
      };
      const res = { json: jest.fn() };

      await getExpenses(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.data.length).toBe(2);
      expect(response.data.every(e => e.category === 'Supplies')).toBe(true);
    });

    it('should filter by status', async () => {
      const req = {
        query: { status: 'Paid' }
      };
      const res = { json: jest.fn() };

      await getExpenses(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.data.length).toBe(2);
      expect(response.data.every(e => e.status === 'Paid')).toBe(true);
    });

    it('should filter by date range', async () => {
      const req = {
        query: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      };
      const res = { json: jest.fn() };

      await getExpenses(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.data.length).toBe(2);
    });

    it('should paginate results', async () => {
      const req = {
        query: {
          page: 1,
          limit: 2
        }
      };
      const res = { json: jest.fn() };

      await getExpenses(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.data.length).toBe(2);
      expect(response.page).toBe(1);
      expect(response.pages).toBe(2);
    });

    it('should include summary statistics', async () => {
      const req = { query: {} };
      const res = { json: jest.fn() };

      await getExpenses(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.summary).toBeDefined();
      expect(response.summary.totalAmount).toBe(450);
      expect(response.summary.count).toBe(3);
    });
  });

  describe('getExpenseById', () => {
    it('should return expense by ID', async () => {
      const expense = await Expense.create({
        title: 'Test Expense',
        amount: 100,
        date: new Date(),
        createdBy: testUser._id
      });

      const req = {
        params: { id: expense._id }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await getExpenseById(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data._id.toString()).toBe(expense._id.toString());
    });

    it('should return 404 when expense not found', async () => {
      const req = {
        params: { id: '507f1f77bcf86cd799439011' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getExpenseById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Expense not found'
      });
    });
  });

  describe('updateExpense', () => {
    it('should update expense fields', async () => {
      const expense = await Expense.create({
        title: 'Original Title',
        amount: 100,
        date: new Date(),
        createdBy: testUser._id
      });

      const req = {
        params: { id: expense._id },
        body: {
          title: 'Updated Title',
          amount: 200
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await updateExpense(req, res);

      const updatedExpense = await Expense.findById(expense._id);
      expect(updatedExpense.title).toBe('Updated Title');
      expect(updatedExpense.amount).toBe(200);
    });

    it('should set approval info when status changes to Paid', async () => {
      const expense = await Expense.create({
        title: 'Test Expense',
        amount: 100,
        date: new Date(),
        status: 'Pending',
        createdBy: testUser._id
      });

      const req = {
        params: { id: expense._id },
        body: { status: 'Paid' },
        user: { id: testUser._id }
      };
      const res = {
        json: jest.fn()
      };

      await updateExpense(req, res);

      const updatedExpense = await Expense.findById(expense._id);
      expect(updatedExpense.status).toBe('Paid');
      expect(updatedExpense.approvedBy.toString()).toBe(testUser._id.toString());
      expect(updatedExpense.approvedAt).toBeDefined();
    });
  });

  describe('deleteExpense', () => {
    it('should delete expense', async () => {
      const expense = await Expense.create({
        title: 'Test Expense',
        amount: 100,
        date: new Date(),
        createdBy: testUser._id
      });

      const req = {
        params: { id: expense._id }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await deleteExpense(req, res);

      const deletedExpense = await Expense.findById(expense._id);
      expect(deletedExpense).toBeNull();
    });
  });

  describe('getExpenseSummary', () => {
    beforeEach(async () => {
      await Expense.create([
        {
          title: 'Expense 1',
          amount: 100,
          date: new Date('2026-01-15'),
          category: 'Supplies',
          status: 'Paid',
          createdBy: testUser._id
        },
        {
          title: 'Expense 2',
          amount: 200,
          date: new Date('2026-01-20'),
          category: 'Equipment',
          status: 'Paid',
          createdBy: testUser._id
        }
      ]);
    });

    it('should return expense summary statistics', async () => {
      const req = { query: {} };
      const res = { json: jest.fn() };

      await getExpenseSummary(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data.byCategory).toBeDefined();
      expect(response.data.totals).toBeDefined();
      expect(response.data.totals.totalAmount).toBe(300);
    });
  });
});
