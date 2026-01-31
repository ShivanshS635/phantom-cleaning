/**
 * Unit Tests for Job Controller
 * 
 * Tests job controller functions: addJob, getJobs, updateJobStatus, assignCleaner.
 * 
 * Key Test Cases:
 * - Create job successfully
 * - Create task when employee is assigned
 * - Get jobs with filters
 * - Update job status
 * - Sync task status with job status
 * - Assign cleaner to job
 * - Validation errors
 */

const { addJob, getJobs, updateJobStatus, assignCleaner } = require('../../../controllers/jobController');
const Job = require('../../../models/Job');
const Task = require('../../../models/Task');
const Employee = require('../../../models/Employee');
const { upsertJob } = require('../../../utils/excelService');

// Mock excel service
jest.mock('../../../utils/excelService', () => ({
  upsertJob: jest.fn().mockResolvedValue(undefined)
}));

describe('Job Controller', () => {
  let testEmployee;
  let testUser;

  beforeEach(async () => {
    await Job.deleteMany({});
    await Task.deleteMany({});
    await Employee.deleteMany({});

    testEmployee = await Employee.create({
      name: 'Test Employee',
      phone: '0412345678',
      email: 'testemployee@test.com',
      role: 'Cleaner',
      state: 'Sydney',
      status: 'Active'
    });

    // Mock user for req.user
    testUser = {
      id: '507f1f77bcf86cd799439011',
      role: 'Admin'
    };
  });

  describe('addJob', () => {
    it('should create a job successfully', async () => {
      const req = {
        body: {
          customerName: 'Test Customer',
          phone: '0412345678',
          state: 'Sydney',
          price: 150,
          date: '2026-02-15',
          time: '10:00'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await addJob(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();

      const createdJob = await Job.findOne({ customerName: 'Test Customer' });
      expect(createdJob).toBeDefined();
      expect(createdJob.price).toBe(150);
    });

    it('should create a task when employee is assigned', async () => {
      const req = {
        body: {
          customerName: 'Test Customer',
          phone: '0412345678',
          state: 'Sydney',
          price: 150,
          assignedEmployee: testEmployee._id,
          date: '2026-02-15',
          address: '123 Test St',
          city: 'Sydney'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await addJob(req, res);

      const createdJob = await Job.findOne({ customerName: 'Test Customer' });
      const createdTask = await Task.findOne({ job: createdJob._id });

      expect(createdTask).toBeDefined();
      expect(createdTask.assignedTo.toString()).toBe(testEmployee._id.toString());
      expect(createdTask.status).toBe('Pending');
    });

    it('should not create task when no employee is assigned', async () => {
      const req = {
        body: {
          customerName: 'Test Customer',
          phone: '0412345678',
          state: 'Sydney',
          price: 150
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await addJob(req, res);

      const createdJob = await Job.findOne({ customerName: 'Test Customer' });
      const tasks = await Task.find({ job: createdJob._id });

      expect(tasks.length).toBe(0);
    });

    it('should call upsertJob after creating job', async () => {
      const req = {
        body: {
          customerName: 'Test Customer',
          phone: '0412345678',
          state: 'Sydney',
          price: 150,
          date: '2026-02-15'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await addJob(req, res);

      // Wait for async upsertJob
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(upsertJob).toHaveBeenCalled();
    });

    it('should return 400 for invalid job data', async () => {
      const req = {
        body: {
          customerName: 'Test Customer'
          // Missing required fields
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await addJob(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getJobs', () => {
    beforeEach(async () => {
      // Create test jobs
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

    it('should return all jobs when no filter is provided', async () => {
      const req = {
        query: {}
      };
      const res = {
        json: jest.fn()
      };

      await getJobs(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.data.length).toBe(2);
      expect(response.meta.total).toBe(2);
    });

    it('should filter jobs by status', async () => {
      const req = {
        query: {
          status: 'Completed'
        }
      };
      const res = {
        json: jest.fn()
      };

      await getJobs(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.data.length).toBe(1);
      expect(response.data[0].status).toBe('Completed');
    });

    it('should populate assignedEmployee', async () => {
      const job = await Job.create({
        customerName: 'Customer 3',
        phone: '0412345680',
        state: 'Sydney',
        price: 150,
        assignedEmployee: testEmployee._id
      });

      const req = {
        query: {}
      };
      const res = {
        json: jest.fn()
      };

      await getJobs(req, res);

      const response = res.json.mock.calls[0][0];
      const jobWithEmployee = response.data.find(j => j._id.toString() === job._id.toString());
      expect(jobWithEmployee.assignedEmployee).toBeDefined();
    });
  });

  describe('updateJobStatus', () => {
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

    it('should update job status successfully', async () => {
      const req = {
        params: { id: testJob._id },
        body: { status: 'Completed' }
      };
      const res = {
        json: jest.fn()
      };

      await updateJobStatus(req, res);

      expect(res.json).toHaveBeenCalled();
      const updatedJob = await Job.findById(testJob._id);
      expect(updatedJob.status).toBe('Completed');
    });

    it('should sync task status when job status changes', async () => {
      const task = await Task.create({
        title: 'Test Task',
        description: 'Test',
        assignedTo: testEmployee._id,
        job: testJob._id,
        dueDate: new Date(),
        status: 'Pending'
      });

      const req = {
        params: { id: testJob._id },
        body: { status: 'Completed' }
      };
      const res = {
        json: jest.fn()
      };

      await updateJobStatus(req, res);

      const updatedTask = await Task.findById(task._id);
      expect(updatedTask.status).toBe('Completed');
    });

    it('should return 400 for invalid status', async () => {
      const req = {
        params: { id: testJob._id },
        body: { status: 'InvalidStatus' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await updateJobStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid status' });
    });

    it('should return 404 when job not found', async () => {
      const req = {
        params: { id: '507f1f77bcf86cd799439011' },
        body: { status: 'Completed' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await updateJobStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Job not found' });
    });

    it('should call upsertJob for Completed/Redo/Cancelled status', async () => {
      const req = {
        params: { id: testJob._id },
        body: { status: 'Completed' }
      };
      const res = {
        json: jest.fn()
      };

      await updateJobStatus(req, res);

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(upsertJob).toHaveBeenCalled();
    });
  });

  describe('assignCleaner', () => {
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
      const req = {
        params: { id: testJob._id },
        body: { employeeId: testEmployee._id }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await assignCleaner(req, res);

      const updatedJob = await Job.findById(testJob._id);
      expect(updatedJob.assignedEmployee.toString()).toBe(testEmployee._id.toString());
    });

    it('should create task if task does not exist', async () => {
      const req = {
        params: { id: testJob._id },
        body: { employeeId: testEmployee._id }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await assignCleaner(req, res);

      const task = await Task.findOne({ job: testJob._id });
      expect(task).toBeDefined();
      expect(task.assignedTo.toString()).toBe(testEmployee._id.toString());
    });

    it('should update existing task if task exists', async () => {
      const task = await Task.create({
        title: 'Test Task',
        description: 'Test',
        assignedTo: testEmployee._id,
        job: testJob._id,
        dueDate: new Date(),
        status: 'Pending'
      });

      const newEmployee = await Employee.create({
        name: 'New Employee',
        phone: '0498765432',
        email: 'newemployee@test.com',
        role: 'Cleaner',
        state: 'Sydney',
        status: 'Active'
      });

      const req = {
        params: { id: testJob._id },
        body: { employeeId: newEmployee._id }
      };
      const res = {
        json: jest.fn()
      };

      await assignCleaner(req, res);

      const updatedTask = await Task.findById(task._id);
      expect(updatedTask.assignedTo.toString()).toBe(newEmployee._id.toString());
    });

    it('should return 400 when employeeId is missing', async () => {
      const req = {
        params: { id: testJob._id },
        body: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await assignCleaner(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Employee ID is required' });
    });

    it('should return 404 when job not found', async () => {
      const req = {
        params: { id: '507f1f77bcf86cd799439011' },
        body: { employeeId: testEmployee._id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await assignCleaner(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Job not found' });
    });
  });
});
