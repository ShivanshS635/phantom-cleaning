/**
 * Integration Tests for Expense Routes
 * 
 * Tests complete request/response cycle for expense endpoints.
 * 
 * Endpoints tested:
 * - GET /api/expenses
 * - GET /api/expenses/:id
 * - POST /api/expenses
 * - PUT /api/expenses/:id
 * - DELETE /api/expenses/:id
 * - GET /api/expenses/stats/summary
 */

const request = require('supertest');
const express = require('express');
const expenseRoutes = require('../../../routes/expenseRoutes');
const Expense = require('../../../models/Expense');
const User = require('../../../models/User');
const { generateToken } = require('../../helpers/testHelpers');

const app = express();
app.use(express.json());
app.use('/api/expenses', expenseRoutes);

describe('Expense Routes Integration Tests', () => {
  let testUser;
  let adminToken;
  let managerToken;

  beforeEach(async () => {
    await Expense.deleteMany({});
    await User.deleteMany({});

    testUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'hashedPassword123',
      role: 'Admin'
    });

    const managerUser = await User.create({
      name: 'Manager User',
      email: 'manager@example.com',
      password: 'hashedPassword123',
      role: 'Manager'
    });

    adminToken = generateToken({ id: testUser._id, role: 'Admin' });
    managerToken = generateToken({ id: managerUser._id, role: 'Manager' });
  });

  describe('GET /api/expenses', () => {
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
          status: 'Pending',
          createdBy: testUser._id
        }
      ]);
    });

    it('should return expenses for admin', async () => {
      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.summary).toBeDefined();
    });

    it('should filter expenses by category', async () => {
      const response = await request(app)
        .get('/api/expenses?category=Supplies')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].category).toBe('Supplies');
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Admin access only');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/expenses');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/expenses', () => {
    it('should create expense for admin', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'New Expense',
          amount: 150,
          date: '2026-02-15',
          category: 'Supplies'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Expense');
      expect(response.body.data.createdBy).toBeDefined();
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'New Expense'
          // Missing amount and date
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Title, amount, and date are required');
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          title: 'New Expense',
          amount: 150,
          date: '2026-02-15'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/expenses/:id', () => {
    let testExpense;

    beforeEach(async () => {
      testExpense = await Expense.create({
        title: 'Test Expense',
        amount: 100,
        date: new Date(),
        createdBy: testUser._id
      });
    });

    it('should return expense by ID for admin', async () => {
      const response = await request(app)
        .get(`/api/expenses/${testExpense._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id.toString()).toBe(testExpense._id.toString());
    });

    it('should return 404 when expense not found', async () => {
      const mongoose = require('mongoose');
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/expenses/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/expenses/:id', () => {
    let testExpense;

    beforeEach(async () => {
      testExpense = await Expense.create({
        title: 'Original Title',
        amount: 100,
        date: new Date(),
        status: 'Pending',
        createdBy: testUser._id
      });
    });

    it('should update expense for admin', async () => {
      const response = await request(app)
        .put(`/api/expenses/${testExpense._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Title',
          amount: 200,
          status: 'Paid'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.amount).toBe(200);
      expect(response.body.data.status).toBe('Paid');
    });

    it('should set approval info when status changes to Paid', async () => {
      const response = await request(app)
        .put(`/api/expenses/${testExpense._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Paid' });

      expect(response.status).toBe(200);
      expect(response.body.data.approvedBy).toBeDefined();
      expect(response.body.data.approvedAt).toBeDefined();
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    let testExpense;

    beforeEach(async () => {
      testExpense = await Expense.create({
        title: 'Test Expense',
        amount: 100,
        date: new Date(),
        createdBy: testUser._id
      });
    });

    it('should delete expense for admin', async () => {
      const response = await request(app)
        .delete(`/api/expenses/${testExpense._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const deletedExpense = await Expense.findById(testExpense._id);
      expect(deletedExpense).toBeNull();
    });
  });

  describe('GET /api/expenses/stats/summary', () => {
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

    it('should return expense summary for admin', async () => {
      const response = await request(app)
        .get('/api/expenses/stats/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.byCategory).toBeDefined();
      expect(response.body.data.totals).toBeDefined();
      expect(response.body.data.totals.totalAmount).toBe(300);
    });

    it('should filter summary by date range', async () => {
      const response = await request(app)
        .get('/api/expenses/stats/summary?startDate=2026-01-01&endDate=2026-01-31')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totals.totalAmount).toBe(300);
    });
  });
});
