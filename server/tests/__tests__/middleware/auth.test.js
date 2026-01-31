/**
 * Unit Tests for Authentication Middleware
 * 
 * Tests JWT token verification and request authentication.
 * 
 * Key Test Cases:
 * - Valid token → sets req.user
 * - Missing token → 401 Unauthorized
 * - Invalid token → 401 Unauthorized
 * - Expired token → 401 Unauthorized
 */

const jwt = require('jsonwebtoken');
const auth = require('../../../middleware/auth');
const authMiddleware = require('../../../middleware/auth.middleware');

describe('Auth Middleware - auth.js', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('should call next() when valid token is provided', () => {
    const token = jwt.sign(
      { id: '507f1f77bcf86cd799439011', role: 'Admin' },
      process.env.JWT_SECRET
    );
    req.headers.authorization = `Bearer ${token}`;

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('507f1f77bcf86cd799439011');
    expect(req.user.role).toBe('Admin');
  });

  it('should return 401 when token is missing', () => {
    req.headers.authorization = undefined;

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, access denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header is missing Bearer prefix', () => {
    req.headers.authorization = 'InvalidToken';

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', () => {
    req.headers.authorization = 'Bearer invalid-token-here';

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is signed with wrong secret', () => {
    const token = jwt.sign(
      { id: '507f1f77bcf86cd799439011', role: 'Admin' },
      'wrong-secret'
    );
    req.headers.authorization = `Bearer ${token}`;

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle token with different user roles', () => {
    const roles = ['SuperAdmin', 'Admin', 'Manager', 'Cleaner'];
    
    roles.forEach(role => {
      const token = jwt.sign(
        { id: '507f1f77bcf86cd799439011', role },
        process.env.JWT_SECRET
      );
      req.headers.authorization = `Bearer ${token}`;
      
      auth(req, res, next);
      
      expect(req.user.role).toBe(role);
      expect(next).toHaveBeenCalled();
      
      // Reset for next iteration
      next.mockClear();
    });
  });
});

describe('Auth Middleware - auth.middleware.js', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('protect', () => {
    it('should call next() when valid token is provided', () => {
      const token = jwt.sign(
        { id: '507f1f77bcf86cd799439011', role: 'Admin' },
        process.env.JWT_SECRET
      );
      req.headers.authorization = `Bearer ${token}`;

      authMiddleware.protect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it('should return 401 when token is missing', () => {
      req.headers.authorization = undefined;

      authMiddleware.protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      req.headers.authorization = 'Bearer invalid-token';

      authMiddleware.protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should call next() when user role is in allowed roles', () => {
      req.user = { id: '507f1f77bcf86cd799439011', role: 'Admin' };
      const authorizeAdmin = authMiddleware.authorize('Admin', 'SuperAdmin');

      authorizeAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 when user role is not in allowed roles', () => {
      req.user = { id: '507f1f77bcf86cd799439011', role: 'Cleaner' };
      const authorizeAdmin = authMiddleware.authorize('Admin', 'SuperAdmin');

      authorizeAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle multiple allowed roles', () => {
      req.user = { id: '507f1f77bcf86cd799439011', role: 'Manager' };
      const authorizeManager = authMiddleware.authorize('Manager', 'Admin');

      authorizeManager(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('adminOnly', () => {
    it('should call next() when user is Admin', () => {
      req.user = { id: '507f1f77bcf86cd799439011', role: 'Admin' };

      authMiddleware.adminOnly(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() when user is SuperAdmin', () => {
      req.user = { id: '507f1f77bcf86cd799439011', role: 'SuperAdmin' };

      authMiddleware.adminOnly(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 when user is Manager', () => {
      req.user = { id: '507f1f77bcf86cd799439011', role: 'Manager' };

      authMiddleware.adminOnly(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Admin access only' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when user is Cleaner', () => {
      req.user = { id: '507f1f77bcf86cd799439011', role: 'Cleaner' };

      authMiddleware.adminOnly(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Admin access only' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when req.user is undefined', () => {
      req.user = undefined;

      authMiddleware.adminOnly(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
