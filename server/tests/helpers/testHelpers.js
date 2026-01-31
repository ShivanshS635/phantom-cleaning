const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Employee = require('../../models/Employee');
const Job = require('../../models/Job');
const Expense = require('../../models/Expense');

/**
 * Generate a JWT token for testing
 * @param {Object} userData - User data to encode in token
 * @returns {string} JWT token
 */
exports.generateToken = (userData = {}) => {
  const defaultUser = {
    id: '507f1f77bcf86cd799439011',
    role: 'Admin',
    ...userData
  };
  return jwt.sign(defaultUser, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Create a test user in the database
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
exports.createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'hashedPassword123',
    role: 'Admin',
    ...userData
  };
  return await User.create(defaultUser);
};

/**
 * Create a test employee in the database
 * @param {Object} employeeData - Employee data
 * @returns {Promise<Object>} Created employee
 */
exports.createTestEmployee = async (employeeData = {}) => {
  const defaultEmployee = {
    name: 'Test Employee',
    phone: '0412345678',
    email: `employee${Date.now()}@example.com`,
    role: 'Cleaner',
    state: 'Sydney',
    status: 'Active',
    ...employeeData
  };
  return await Employee.create(defaultEmployee);
};

/**
 * Create a test job in the database
 * @param {Object} jobData - Job data
 * @returns {Promise<Object>} Created job
 */
exports.createTestJob = async (jobData = {}) => {
  const defaultJob = {
    customerName: 'Test Customer',
    phone: '0412345678',
    email: 'customer@example.com',
    address: '123 Test St',
    city: 'Sydney',
    state: 'Sydney',
    date: '2026-02-15',
    time: '10:00',
    areas: 'Kitchen, Bathroom',
    workType: 'Deep Clean',
    estTime: '2 hours',
    price: 150,
    status: 'Upcoming',
    ...jobData
  };
  return await Job.create(defaultJob);
};

/**
 * Create a test expense in the database
 * @param {Object} expenseData - Expense data
 * @param {string} userId - User ID for createdBy
 * @returns {Promise<Object>} Created expense
 */
exports.createTestExpense = async (expenseData = {}, userId = null) => {
  const defaultExpense = {
    title: 'Test Expense',
    amount: 100,
    date: new Date(),
    category: 'Supplies',
    description: 'Test expense description',
    status: 'Pending',
    paymentMethod: 'Credit Card',
    vendor: 'Test Vendor',
    ...expenseData
  };
  
  if (userId) {
    defaultExpense.createdBy = userId;
  }
  
  return await Expense.create(defaultExpense);
};

/**
 * Create authenticated request headers
 * @param {Object} userData - User data for token
 * @returns {Object} Headers object
 */
exports.getAuthHeaders = (userData = {}) => {
  const token = exports.generateToken(userData);
  return {
    Authorization: `Bearer ${token}`
  };
};

/**
 * Wait for a promise to resolve (useful for async operations)
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise}
 */
exports.wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
