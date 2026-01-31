/**
 * Unit Tests for Auth Controller
 * 
 * Tests authentication controller functions: signup and login.
 * 
 * Key Test Cases:
 * - Successful signup with valid data
 * - Signup with duplicate email (should fail)
 * - Successful login with valid credentials
 * - Login with invalid email (should fail)
 * - Login with invalid password (should fail)
 * - Password hashing verification
 * - JWT token generation
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { signup, login } = require('../../../controllers/authController');
const User = require('../../../models/User');

describe('Auth Controller', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  describe('signup', () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it('should create a new user and return token', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'Admin'
      };

      await signup(req, res);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();

      const response = res.json.mock.calls[0][0];
      expect(response.token).toBeDefined();
      expect(response.user).toBeDefined();
      expect(response.user.email).toBe('test@example.com');
      expect(response.user.name).toBe('Test User');
      expect(response.user.role).toBe('Admin');
      expect(response.user.password).toBeUndefined(); // Password should not be in response

      // Verify user was created in database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeDefined();
      expect(user.name).toBe('Test User');
      
      // Verify password was hashed
      const isMatch = await bcrypt.compare('password123', user.password);
      expect(isMatch).toBe(true);
    });

    it('should return 400 when email already exists', async () => {
      // Create existing user
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'hashedPassword',
        role: 'Admin'
      });

      req.body = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'Manager'
      };

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });

    it('should hash password before saving', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'Admin'
      };

      await signup(req, res);

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user.password).not.toBe('password123');
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash length
    });

    it('should generate valid JWT token', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'Admin'
      };

      await signup(req, res);

      const response = res.json.mock.calls[0][0];
      const token = response.token;

      // Verify token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBeDefined();
      expect(decoded.role).toBe('Admin');
    });

    it('should handle database errors gracefully', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'Admin'
      };

      // Mock User.create to throw error
      const originalCreate = User.create;
      User.create = jest.fn().mockRejectedValue(new Error('Database error'));

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Signup failed' });

      // Restore original
      User.create = originalCreate;
    });
  });

  describe('login', () => {
    let req, res;
    let testUser;
    const plainPassword = 'password123';

    beforeEach(async () => {
      // Create a test user with hashed password
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'Admin'
      });

      req = {
        body: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it('should login with valid credentials', async () => {
      req.body = {
        email: 'test@example.com',
        password: plainPassword
      };

      await login(req, res);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();

      const response = res.json.mock.calls[0][0];
      expect(response.token).toBeDefined();
      expect(response.user).toBeDefined();
      expect(response.user.email).toBe('test@example.com');
      expect(response.user.password).toBeUndefined();
    });

    it('should return 400 when email does not exist', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: plainPassword
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 400 when password is incorrect', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should generate valid JWT token on successful login', async () => {
      req.body = {
        email: 'test@example.com',
        password: plainPassword
      };

      await login(req, res);

      const response = res.json.mock.calls[0][0];
      const token = response.token;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(testUser._id.toString());
      expect(decoded.role).toBe('Admin');
    });

    it('should handle database errors gracefully', async () => {
      req.body = {
        email: 'test@example.com',
        password: plainPassword
      };

      // Mock User.findOne to throw error
      const originalFindOne = User.findOne;
      User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Login failed' });

      // Restore original
      User.findOne = originalFindOne;
    });

    it('should work with different user roles', async () => {
      const roles = ['SuperAdmin', 'Admin', 'Manager', 'Cleaner'];

      for (const role of roles) {
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const user = await User.create({
          name: `${role} User`,
          email: `${role.toLowerCase()}@example.com`,
          password: hashedPassword,
          role
        });

        req.body = {
          email: `${role.toLowerCase()}@example.com`,
          password: plainPassword
        };

        await login(req, res);

        const response = res.json.mock.calls[res.json.mock.calls.length - 1][0];
        expect(response.user.role).toBe(role);

        // Clean up
        await User.findByIdAndDelete(user._id);
      }
    });
  });
});
