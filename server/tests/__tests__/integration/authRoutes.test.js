/**
 * Integration Tests for Auth Routes
 * 
 * Tests complete request/response cycle for authentication endpoints.
 * Uses in-memory MongoDB and real Express app.
 * 
 * Endpoints tested:
 * - POST /api/auth/signup
 * - POST /api/auth/login
 * - GET /api/auth/me
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../../../routes/authRoutes');
const User = require('../../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes Integration Tests', () => {
  let testUser;
  const plainPassword = 'password123';

  beforeEach(async () => {
    await User.deleteMany({});
    
    // Create test user for login tests
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'Admin'
    });
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user and return token', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'Manager'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user.name).toBe('New User');
      expect(response.body.user.password).toBeUndefined();

      // Verify user in database
      const user = await User.findOne({ email: 'newuser@example.com' });
      expect(user).toBeDefined();
    });

    it('should return 400 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Duplicate User',
          email: 'test@example.com',
          password: 'password123',
          role: 'Admin'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });

    it('should hash password before saving', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'New User',
          email: 'hashed@example.com',
          password: 'password123',
          role: 'Admin'
        });

      const user = await User.findOne({ email: 'hashed@example.com' });
      expect(user.password).not.toBe('password123');
      expect(user.password.length).toBeGreaterThan(20);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: plainPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: plainPassword
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return valid JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: plainPassword
        });

      const token = response.body.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(testUser._id.toString());
      expect(decoded.role).toBe('Admin');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid token', async () => {
      const token = jwt.sign(
        { id: testUser._id, role: testUser.role },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.password).toBeUndefined();
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
