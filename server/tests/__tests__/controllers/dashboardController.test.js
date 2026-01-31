/**
 * Unit Tests for Dashboard Controller
 * 
 * Tests dashboard statistics aggregation.
 */

const { getDashboardStats } = require('../../../controllers/dashboardController');
const Job = require('../../../models/Job');
const Employee = require('../../../models/Employee');

describe('Dashboard Controller', () => {
  beforeEach(async () => {
    await Job.deleteMany({});
    await Employee.deleteMany({});
  });

  it('should return dashboard statistics', async () => {
    // Create test data
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
      },
      {
        customerName: 'Customer 3',
        phone: '0412345680',
        state: 'Sydney',
        price: 100,
        status: 'Completed'
      }
    ]);

    await Employee.create([
      {
        name: 'Employee 1',
        phone: '0412345678',
        email: 'employee1@test.com',
        role: 'Cleaner',
        state: 'Sydney',
        status: 'Active'
      },
      {
        name: 'Employee 2',
        phone: '0412345679',
        email: 'employee2@test.com',
        role: 'Cleaner',
        state: 'Melbourne',
        status: 'Active'
      },
      {
        name: 'Employee 3',
        phone: '0412345680',
        email: 'employee3@test.com',
        role: 'Manager',
        state: 'Sydney',
        status: 'Active'
      }
    ]);

    const req = {};
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await getDashboardStats(req, res);

    expect(res.json).toHaveBeenCalled();
    const response = res.json.mock.calls[0][0];
    expect(response.totalJobs).toBe(3);
    expect(response.completedJobs).toBe(2);
    expect(response.totalRevenue).toBe(300);
    expect(response.activeCleaners).toBe(2);
  });

  it('should return zero values when no data exists', async () => {
    const req = {};
    const res = {
      json: jest.fn()
    };

    await getDashboardStats(req, res);

    const response = res.json.mock.calls[0][0];
    expect(response.totalJobs).toBe(0);
    expect(response.completedJobs).toBe(0);
    expect(response.totalRevenue).toBe(0);
    expect(response.activeCleaners).toBe(0);
  });

  it('should count today jobs correctly', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await Job.create([
      {
        customerName: 'Today Job',
        phone: '0412345678',
        state: 'Sydney',
        price: 150,
        createdAt: today
      },
      {
        customerName: 'Yesterday Job',
        phone: '0412345679',
        state: 'Sydney',
        price: 200,
        createdAt: yesterday
      }
    ]);

    const req = {};
    const res = {
      json: jest.fn()
    };

    await getDashboardStats(req, res);

    const response = res.json.mock.calls[0][0];
    expect(response.todayJobs).toBe(1);
  });
});
