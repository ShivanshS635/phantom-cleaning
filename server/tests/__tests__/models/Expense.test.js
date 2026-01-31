/**
 * Unit Tests for Expense Model
 * 
 * Tests Mongoose schema validation for Expense model including:
 * - Required fields
 * - Category enum validation
 * - Status enum validation
 * - Payment method enum validation
 * - Amount validation (min: 0)
 * - Description max length
 * - Static methods
 * - Instance methods
 */

const Expense = require('../../../models/Expense');
const User = require('../../../models/User');
const mongoose = require('mongoose');

describe('Expense Model', () => {
  let testUser;

  beforeAll(async () => {
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword123',
      role: 'Admin'
    });
  });

  afterEach(async () => {
    await Expense.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create an expense with valid data', async () => {
      const expenseData = {
        title: 'Test Expense',
        amount: 100,
        date: new Date(),
        createdBy: testUser._id
      };

      const expense = await Expense.create(expenseData);

      expect(expense._id).toBeDefined();
      expect(expense.title).toBe(expenseData.title);
      expect(expense.amount).toBe(expenseData.amount);
      expect(expense.status).toBe('Pending'); // Default status
      expect(expense.category).toBe('Other'); // Default category
    });

    it('should require title field', async () => {
      const expenseData = {
        amount: 100,
        date: new Date(),
        createdBy: testUser._id
      };

      await expect(Expense.create(expenseData)).rejects.toThrow();
    });

    it('should require amount field', async () => {
      const expenseData = {
        title: 'Test Expense',
        date: new Date(),
        createdBy: testUser._id
      };

      await expect(Expense.create(expenseData)).rejects.toThrow();
    });

    it('should default date field when not provided', async () => {
      const expenseData = {
        title: 'Test Expense',
        amount: 100,
        createdBy: testUser._id
      };

      const expense = await Expense.create(expenseData);
      expect(expense.date).toBeDefined();
      expect(expense.date).toBeInstanceOf(Date);
    });

    it('should require createdBy field', async () => {
      const expenseData = {
        title: 'Test Expense',
        amount: 100,
        date: new Date()
      };

      await expect(Expense.create(expenseData)).rejects.toThrow();
    });
  });

  describe('Amount Validation', () => {
    it('should accept positive amount', async () => {
      const expenseData = {
        title: 'Test Expense',
        amount: 100.50,
        date: new Date(),
        createdBy: testUser._id
      };

      const expense = await Expense.create(expenseData);
      expect(expense.amount).toBe(100.50);
    });

    it('should accept zero amount', async () => {
      const expenseData = {
        title: 'Test Expense',
        amount: 0,
        date: new Date(),
        createdBy: testUser._id
      };

      const expense = await Expense.create(expenseData);
      expect(expense.amount).toBe(0);
    });

    it('should reject negative amount', async () => {
      const expenseData = {
        title: 'Test Expense',
        amount: -10,
        date: new Date(),
        createdBy: testUser._id
      };

      await expect(Expense.create(expenseData)).rejects.toThrow();
    });
  });

  describe('Category Enum Validation', () => {
    const validCategories = [
      'Supplies', 'Equipment', 'Travel', 'Marketing', 'Office',
      'Software', 'Services', 'Training', 'Salary', 'Other'
    ];

    validCategories.forEach(category => {
      it(`should accept valid category: ${category}`, async () => {
        const expenseData = {
          title: 'Test Expense',
          amount: 100,
          date: new Date(),
          category,
          createdBy: testUser._id
        };

        const expense = await Expense.create(expenseData);
        expect(expense.category).toBe(category);
      });
    });

    it('should default to "Other" when category is not provided', async () => {
      const expenseData = {
        title: 'Test Expense',
        amount: 100,
        date: new Date(),
        createdBy: testUser._id
      };

      const expense = await Expense.create(expenseData);
      expect(expense.category).toBe('Other');
    });
  });

  describe('Status Enum Validation', () => {
    const validStatuses = ['Pending', 'Paid', 'Reimbursed', 'Cancelled'];

    validStatuses.forEach(status => {
      it(`should accept valid status: ${status}`, async () => {
        const expenseData = {
          title: 'Test Expense',
          amount: 100,
          date: new Date(),
          status,
          createdBy: testUser._id
        };

        const expense = await Expense.create(expenseData);
        expect(expense.status).toBe(status);
      });
    });

    it('should default to "Pending" when status is not provided', async () => {
      const expenseData = {
        title: 'Test Expense',
        amount: 100,
        date: new Date(),
        createdBy: testUser._id
      };

      const expense = await Expense.create(expenseData);
      expect(expense.status).toBe('Pending');
    });
  });

  describe('Payment Method Enum Validation', () => {
    const validPaymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'PayPal', 'Other'];

    validPaymentMethods.forEach(method => {
      it(`should accept valid payment method: ${method}`, async () => {
        const expenseData = {
          title: 'Test Expense',
          amount: 100,
          date: new Date(),
          paymentMethod: method,
          createdBy: testUser._id
        };

        const expense = await Expense.create(expenseData);
        expect(expense.paymentMethod).toBe(method);
      });
    });

    it('should default to "Credit Card" when paymentMethod is not provided', async () => {
      const expenseData = {
        title: 'Test Expense',
        amount: 100,
        date: new Date(),
        createdBy: testUser._id
      };

      const expense = await Expense.create(expenseData);
      expect(expense.paymentMethod).toBe('Credit Card');
    });
  });

  describe('Description Validation', () => {
    it('should accept description within max length', async () => {
      const expenseData = {
        title: 'Test Expense',
        amount: 100,
        date: new Date(),
        description: 'A'.repeat(500),
        createdBy: testUser._id
      };

      const expense = await Expense.create(expenseData);
      expect(expense.description.length).toBe(500);
    });

    it('should reject description exceeding max length', async () => {
      const expenseData = {
        title: 'Test Expense',
        amount: 100,
        date: new Date(),
        description: 'A'.repeat(501),
        createdBy: testUser._id
      };

      await expect(Expense.create(expenseData)).rejects.toThrow();
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create test expenses
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      await Expense.create([
        {
          title: 'Expense 1',
          amount: 100,
          date: new Date('2026-01-15'),
          status: 'Paid',
          createdBy: testUser._id
        },
        {
          title: 'Expense 2',
          amount: 200,
          date: new Date('2026-01-20'),
          status: 'Paid',
          createdBy: testUser._id
        },
        {
          title: 'Expense 3',
          amount: 50,
          date: new Date('2026-01-25'),
          status: 'Cancelled',
          createdBy: testUser._id
        }
      ]);
    });

    it('should calculate total by period correctly', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const result = await Expense.getTotalByPeriod(startDate, endDate);

      expect(result).toBeDefined();
      expect(result[0].totalAmount).toBe(300); // 100 + 200 (Cancelled excluded)
      expect(result[0].count).toBe(2);
    });

    it('should group expenses by category', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      await Expense.create({
        title: 'Supplies Expense',
        amount: 75,
        date: new Date('2026-01-10'),
        category: 'Supplies',
        createdBy: testUser._id
      });

      const result = await Expense.getByCategory(startDate, endDate);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Instance Methods', () => {
    it('should mark expense as paid with approval info', async () => {
      const expense = await Expense.create({
        title: 'Test Expense',
        amount: 100,
        date: new Date(),
        createdBy: testUser._id
      });

      await expense.markAsPaid(testUser._id);

      expect(expense.status).toBe('Paid');
      expect(expense.approvedBy.toString()).toBe(testUser._id.toString());
      expect(expense.approvedAt).toBeInstanceOf(Date);
    });
  });
});
