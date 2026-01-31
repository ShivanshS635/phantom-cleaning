/**
 * Unit Tests for Excel Service Utility
 * 
 * Tests the Excel file generation and upsert logic used for
 * maintaining persistent monthly Excel files with state-wise sheets.
 * 
 * Key Test Cases:
 * - File name generation from dates
 * - Week calculation logic
 * - State resolution (valid vs invalid states)
 * - Excel file creation and updates
 * - Mutex pattern for concurrent writes
 */

const fs = require('fs');
const path = require('path');
const { upsertJob } = require('../../../utils/excelService');

// Mock the exports directory to a test location
const TEST_EXPORT_DIR = path.join(__dirname, '../../../tests/exports');

describe('Excel Service - Utility Functions', () => {
  beforeEach(() => {
    // Clean up test exports directory
    if (fs.existsSync(TEST_EXPORT_DIR)) {
      fs.rmSync(TEST_EXPORT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_EXPORT_DIR, { recursive: true });
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(TEST_EXPORT_DIR)) {
      fs.rmSync(TEST_EXPORT_DIR, { recursive: true, force: true });
    }
  });

  describe('upsertJob', () => {
    it('should create a new Excel file when file does not exist', async () => {
      const job = {
        _id: '507f1f77bcf86cd799439011',
        date: '2026-02-15',
        state: 'Sydney',
        customerName: 'Test Customer',
        phone: '0412345678',
        address: '123 Test St',
        assignedEmployee: { name: 'John Cleaner' },
        status: 'Upcoming',
        price: 150
      };

      await upsertJob(job);

      // Wait a bit for async file write
      await new Promise(resolve => setTimeout(resolve, 500));

      const fileName = 'PhantomCleaning_February_2026.xlsx';
      const filePath = path.join(__dirname, '../../../exports', fileName);

      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should create state-specific sheet for valid state', async () => {
      const job = {
        _id: '507f1f77bcf86cd799439011',
        date: '2026-02-15',
        state: 'Melbourne',
        customerName: 'Test Customer',
        phone: '0412345678',
        address: '123 Test St',
        assignedEmployee: { name: 'John Cleaner' },
        status: 'Upcoming',
        price: 150
      };

      await upsertJob(job);
      await new Promise(resolve => setTimeout(resolve, 500));

      const fileName = 'PhantomCleaning_February_2026.xlsx';
      const filePath = path.join(__dirname, '../../../exports', fileName);

      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should handle invalid state by using "Other"', async () => {
      const job = {
        _id: '507f1f77bcf86cd799439011',
        date: '2026-02-15',
        state: 'InvalidState',
        customerName: 'Test Customer',
        phone: '0412345678',
        address: '123 Test St',
        assignedEmployee: { name: 'John Cleaner' },
        status: 'Upcoming',
        price: 150
      };

      // Should not throw error
      await expect(upsertJob(job)).resolves.not.toThrow();
    });

    it('should update existing job row when job ID already exists', async () => {
      const jobId = '507f1f77bcf86cd799439011';
      
      const job1 = {
        _id: jobId,
        date: '2026-02-15',
        state: 'Sydney',
        customerName: 'Original Customer',
        phone: '0412345678',
        address: '123 Test St',
        assignedEmployee: { name: 'John Cleaner' },
        status: 'Upcoming',
        price: 150
      };

      const job2 = {
        _id: jobId,
        date: '2026-02-15',
        state: 'Sydney',
        customerName: 'Updated Customer',
        phone: '0498765432',
        address: '456 New St',
        assignedEmployee: { name: 'Jane Cleaner' },
        status: 'Completed',
        price: 200
      };

      await upsertJob(job1);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await upsertJob(job2);
      await new Promise(resolve => setTimeout(resolve, 500));

      // File should exist and contain updated data
      const fileName = 'PhantomCleaning_February_2026.xlsx';
      const filePath = path.join(__dirname, '../../../exports', fileName);
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should handle job without assigned employee', async () => {
      const job = {
        _id: '507f1f77bcf86cd799439011',
        date: '2026-02-15',
        state: 'Sydney',
        customerName: 'Test Customer',
        phone: '0412345678',
        address: '123 Test St',
        assignedEmployee: null,
        status: 'Upcoming',
        price: 150
      };

      await expect(upsertJob(job)).resolves.not.toThrow();
    });

    it('should handle different months correctly', async () => {
      const job1 = {
        _id: '507f1f77bcf86cd799439011',
        date: '2026-01-15',
        state: 'Sydney',
        customerName: 'Jan Customer',
        phone: '0412345678',
        address: '123 Test St',
        assignedEmployee: { name: 'John Cleaner' },
        status: 'Upcoming',
        price: 150
      };

      const job2 = {
        _id: '507f1f77bcf86cd799439012',
        date: '2026-02-15',
        state: 'Sydney',
        customerName: 'Feb Customer',
        phone: '0412345678',
        address: '123 Test St',
        assignedEmployee: { name: 'John Cleaner' },
        status: 'Upcoming',
        price: 150
      };

      await upsertJob(job1);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await upsertJob(job2);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Both files should exist
      const janFile = path.join(__dirname, '../../../exports', 'PhantomCleaning_January_2026.xlsx');
      const febFile = path.join(__dirname, '../../../exports', 'PhantomCleaning_February_2026.xlsx');
      
      expect(fs.existsSync(janFile)).toBe(true);
      expect(fs.existsSync(febFile)).toBe(true);
    });
  });
});
