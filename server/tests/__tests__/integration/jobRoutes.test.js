/**
 * Integration Tests for Job Routes
 * 
 * Tests complete request/response cycle for job endpoints.
 * 
 * Endpoints tested:
 * - POST /api/jobs
 * - GET /api/jobs
 * - PUT /api/jobs/:id/status
 * - PUT /api/jobs/:id/assign
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jobRoutes = require('../../../routes/job.routes');
const { protect } = require('../../../middleware/auth.middleware');
const Job = require('../../../models/Job');
const Employee = require('../../../models/Employee');
const Task = require('../../../models/Task');
const User = require('../../../models/User');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../../helpers/testHelpers');

const app = express();
app.use(express.json());
app.use('/api/jobs', protect, jobRoutes);

describe('Job Routes Integration Tests', () => {
  let testUser;
  let testEmployee;
  let authToken;

  beforeEach(async () => {
    await Job.deleteMany({});
    await Task.deleteMany({});
    await Employee.deleteMany({});
    await User.deleteMany({});

    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword123',
      role: 'Admin'
    });

    testEmployee = await Employee.create({
      name: 'Test Employee',
      phone: '0412345678',
      email: 'testemployee@test.com',
      role: 'Cleaner',
      state: 'Sydney',
      status: 'Active'
    });

    authToken = generateToken({ id: testUser._id, role: testUser.role });
  });

  describe('POST /api/jobs', () => {
    it('should create a job with valid data', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerName: 'Test Customer',
          phone: '0412345678',
          state: 'Sydney',
          price: 150,
          date: '2026-02-15',
          time: '10:00'
        });

      expect(response.status).toBe(201);
      expect(response.body.customerName).toBe('Test Customer');
      expect(response.body.price).toBe(150);

      const job = await Job.findOne({ customerName: 'Test Customer' });
      expect(job).toBeDefined();
    });

    it('should create task when employee is assigned', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerName: 'Test Customer',
          phone: '0412345678',
          state: 'Sydney',
          price: 150,
          assignedEmployee: testEmployee._id,
          date: '2026-02-15',
          address: '123 Test St',
          city: 'Sydney'
        });

      expect(response.status).toBe(201);

      const job = await Job.findOne({ customerName: 'Test Customer' });
      const task = await Task.findOne({ job: job._id });
      expect(task).toBeDefined();
      expect(task.assignedTo.toString()).toBe(testEmployee._id.toString());
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .send({
          customerName: 'Test Customer',
          phone: '0412345678',
          state: 'Sydney',
          price: 150
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerName: 'Test Customer'
          // Missing required fields
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/jobs', () => {
    beforeEach(async () => {
      await Job.create([
        {
          customerName: 'Customer 1',
          phone: '0412345678',
          state: 'Sydney',
          price: 150,
          status: 'Upcoming'
        },
        {
          customerName: 'Customer 2',
          phone: '0412345679',
          state: 'Melbourne',
          price: 200,
          status: 'Completed'
        }
      ]);
    });

    it('should return all jobs', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.meta.total).toBe(2);
    });

    it('should filter jobs by status', async () => {
      const response = await request(app)
        .get('/api/jobs?status=Completed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe('Completed');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/jobs');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/jobs/:id/status', () => {
    let testJob;

    beforeEach(async () => {
      testJob = await Job.create({
        customerName: 'Test Customer',
        phone: '0412345678',
        state: 'Sydney',
        price: 150,
        status: 'Upcoming'
      });
    });

    it('should update job status', async () => {
      const response = await request(app)
        .put(`/api/jobs/${testJob._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'Completed' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Status updated');

      const updatedJob = await Job.findById(testJob._id);
      expect(updatedJob.status).toBe('Completed');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put(`/api/jobs/${testJob._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'InvalidStatus' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid status');
    });

    it('should return 404 when job not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/jobs/${fakeId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'Completed' });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/jobs/:id/assign', () => {
    let testJob;

    beforeEach(async () => {
      testJob = await Job.create({
        customerName: 'Test Customer',
        phone: '0412345678',
        state: 'Sydney',
        price: 150,
        date: '2026-02-01'
      });
    });

    it('should assign cleaner to job', async () => {
      const response = await request(app)
        .put(`/api/jobs/${testJob._id}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ employeeId: testEmployee._id });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Cleaner updated successfully');

      const updatedJob = await Job.findById(testJob._id);
      expect(updatedJob.assignedEmployee.toString()).toBe(testEmployee._id.toString());
    });

    it('should return 400 when employeeId is missing', async () => {
      const response = await request(app)
        .put(`/api/jobs/${testJob._id}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Employee ID is required');
    });
  });
});
