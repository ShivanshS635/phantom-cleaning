/**
 * Unit Tests for User Model
 * 
 * Tests Mongoose schema validation, required fields, enum constraints,
 * and default values for the User model.
 * 
 * Key Test Cases:
 * - Required fields validation
 * - Email uniqueness
 * - Role enum validation
 * - Default role value
 * - Timestamps auto-generation
 */

const User = require('../../../models/User');
const mongoose = require('mongoose');

describe('User Model', () => {
  beforeAll(async () => {
    // Connection handled by setup.js
    await User.init();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        role: 'Admin'
      };

      const user = await User.create(userData);

      expect(user._id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should require name field', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require email field', async () => {
      const userData = {
        name: 'Test User',
        password: 'hashedPassword123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require password field', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should enforce email uniqueness', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'hashedPassword123'
      };

      await User.create(userData);

      // Try to create another user with same email
      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('Role Enum Validation', () => {
    const validRoles = ['SuperAdmin', 'Admin', 'Manager', 'Cleaner'];

    validRoles.forEach(role => {
      it(`should accept valid role: ${role}`, async () => {
        const userData = {
          name: 'Test User',
          email: `test${role}@example.com`,
          password: 'hashedPassword123',
          role
        };

        const user = await User.create(userData);
        expect(user.role).toBe(role);
      });
    });

    it('should reject invalid role', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        role: 'InvalidRole'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should default to "Cleaner" when role is not provided', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      const user = await User.create(userData);
      expect(user.role).toBe('Cleaner');
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      const user = await User.create(userData);

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on save', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      const user = await User.create(userData);
      const originalUpdatedAt = user.updatedAt;

      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 100));

      user.name = 'Updated Name';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Data Types', () => {
    it('should store name as string', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      const user = await User.create(userData);
      expect(typeof user.name).toBe('string');
    });

    it('should store email as string', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      const user = await User.create(userData);
      expect(typeof user.email).toBe('string');
    });

    it('should store password as string', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      const user = await User.create(userData);
      expect(typeof user.password).toBe('string');
    });
  });
});
