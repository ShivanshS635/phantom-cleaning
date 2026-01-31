/**
 * Unit Tests for Job Model
 * 
 * Tests Mongoose schema validation for Job model including:
 * - Required fields
 * - State enum validation
 * - Status enum validation
 * - Default values
 * - Employee reference
 */

const Job = require('../../../models/Job');
const Employee = require('../../../models/Employee');
const mongoose = require('mongoose');

describe('Job Model', () => {
  let testEmployee;

  beforeAll(async () => {
    // Create a test employee for job assignment
    testEmployee = await Employee.create({
      name: 'Test Employee',
      phone: '0412345678',
      role: 'Cleaner',
      state: 'Sydney',
      status: 'Active'
    });
  });

  afterEach(async () => {
    await Job.deleteMany({});
  });

  afterAll(async () => {
    await Employee.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a job with valid data', async () => {
      const jobData = {
        customerName: 'Test Customer',
        phone: '0412345678',
        state: 'Sydney',
        price: 150
      };

      const job = await Job.create(jobData);

      expect(job._id).toBeDefined();
      expect(job.customerName).toBe(jobData.customerName);
      expect(job.state).toBe(jobData.state);
      expect(job.price).toBe(jobData.price);
      expect(job.status).toBe('Upcoming'); // Default status
    });

    it('should require customerName field', async () => {
      const jobData = {
        phone: '0412345678',
        state: 'Sydney',
        price: 150
      };

      await expect(Job.create(jobData)).rejects.toThrow();
    });

    it('should require phone field', async () => {
      const jobData = {
        customerName: 'Test Customer',
        state: 'Sydney',
        price: 150
      };

      await expect(Job.create(jobData)).rejects.toThrow();
    });

    it('should require state field', async () => {
      const jobData = {
        customerName: 'Test Customer',
        phone: '0412345678',
        price: 150
      };

      await expect(Job.create(jobData)).rejects.toThrow();
    });

    it('should require price field', async () => {
      const jobData = {
        customerName: 'Test Customer',
        phone: '0412345678',
        state: 'Sydney'
      };

      await expect(Job.create(jobData)).rejects.toThrow();
    });
  });

  describe('State Enum Validation', () => {
    const validStates = ['Sydney', 'Melbourne', 'Adelaide', 'Perth', 'Brisbane'];

    validStates.forEach(state => {
      it(`should accept valid state: ${state}`, async () => {
        const jobData = {
          customerName: 'Test Customer',
          phone: '0412345678',
          state,
          price: 150
        };

        const job = await Job.create(jobData);
        expect(job.state).toBe(state);
      });
    });

    it('should reject invalid state', async () => {
      const jobData = {
        customerName: 'Test Customer',
        phone: '0412345678',
        state: 'InvalidState',
        price: 150
      };

      await expect(Job.create(jobData)).rejects.toThrow();
    });
  });

  describe('Status Enum Validation', () => {
    const validStatuses = ['Upcoming', 'Completed', 'Redo', 'Cancelled'];

    validStatuses.forEach(status => {
      it(`should accept valid status: ${status}`, async () => {
        const jobData = {
          customerName: 'Test Customer',
          phone: '0412345678',
          state: 'Sydney',
          price: 150,
          status
        };

        const job = await Job.create(jobData);
        expect(job.status).toBe(status);
      });
    });

    it('should default to "Upcoming" when status is not provided', async () => {
      const jobData = {
        customerName: 'Test Customer',
        phone: '0412345678',
        state: 'Sydney',
        price: 150
      };

      const job = await Job.create(jobData);
      expect(job.status).toBe('Upcoming');
    });
  });

  describe('Employee Reference', () => {
    it('should accept valid employee ObjectId', async () => {
      const jobData = {
        customerName: 'Test Customer',
        phone: '0412345678',
        state: 'Sydney',
        price: 150,
        assignedEmployee: testEmployee._id
      };

      const job = await Job.create(jobData);
      expect(job.assignedEmployee.toString()).toBe(testEmployee._id.toString());
    });

    it('should allow null assignedEmployee', async () => {
      const jobData = {
        customerName: 'Test Customer',
        phone: '0412345678',
        state: 'Sydney',
        price: 150,
        assignedEmployee: null
      };

      const job = await Job.create(jobData);
      expect(job.assignedEmployee).toBeNull();
    });
  });

  describe('Optional Fields', () => {
    it('should allow optional email field', async () => {
      const jobData = {
        customerName: 'Test Customer',
        phone: '0412345678',
        state: 'Sydney',
        price: 150,
        email: 'customer@example.com'
      };

      const job = await Job.create(jobData);
      expect(job.email).toBe('customer@example.com');
    });

    it('should allow optional address field', async () => {
      const jobData = {
        customerName: 'Test Customer',
        phone: '0412345678',
        state: 'Sydney',
        price: 150,
        address: '123 Test St'
      };

      const job = await Job.create(jobData);
      expect(job.address).toBe('123 Test St');
    });

    it('should allow optional notes field', async () => {
      const jobData = {
        customerName: 'Test Customer',
        phone: '0412345678',
        state: 'Sydney',
        price: 150,
        notes: 'Special instructions'
      };

      const job = await Job.create(jobData);
      expect(job.notes).toBe('Special instructions');
    });
  });

  describe('Price Validation', () => {
    it('should accept positive price', async () => {
      const jobData = {
        customerName: 'Test Customer',
        phone: '0412345678',
        state: 'Sydney',
        price: 150.50
      };

      const job = await Job.create(jobData);
      expect(job.price).toBe(150.50);
    });

    it('should accept zero price', async () => {
      const jobData = {
        customerName: 'Test Customer',
        phone: '0412345678',
        state: 'Sydney',
        price: 0
      };

      const job = await Job.create(jobData);
      expect(job.price).toBe(0);
    });
  });
});
