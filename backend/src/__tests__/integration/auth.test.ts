import request from 'supertest';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { UserRepository } from '../../repositories/UserRepository';
import { AuthService } from '../../services/AuthService';
import { AuthController } from '../../controllers/AuthController';
import { createAuthRouter } from '../../routes/authRoutes';
import bcrypt from 'bcrypt';

// Mock database
const mockDb = {
  query: jest.fn(),
} as unknown as Pool;

// Mock JWT and bcrypt
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('Authentication Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    // Create test app
    app = express();
    app.use(cors());
    app.use(express.json());

    const userRepository = new UserRepository(mockDb);
    const authService = new AuthService(userRepository, 'test-secret');
    const authController = new AuthController(authService);
    
    // Set up routes
    app.post('/api/auth/register', authController.register);
    app.post('/api/auth/login', authController.login);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'newuser',
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      const mockToken = 'mock-jwt-token';

      (mockDb.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] }) // Check if username exists
        .mockResolvedValueOnce({ rows: [{ ...mockUser, created_at: mockUser.createdAt }] }); // Insert new user

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      });
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'a', // Too short
          password: '123', // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 when username already exists', async () => {
      (mockDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 1, username: 'existinguser' }],
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          password: 'password123',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Username already taken');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: 'hashedpassword',
        role: 'user',
        is_locked: false,
        created_at: new Date(),
      };

      const mockToken = 'mock-jwt-token';

      (mockDb.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockUser] }); // Find user by username

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe(mockToken);
    });

    it('should return 401 for invalid credentials', async () => {
      (mockDb.query as jest.Mock).mockResolvedValue({ rows: [] }); // User not found

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 403 for locked account', async () => {
      const mockUser = {
        id: 1,
        username: 'lockeduser',
        password_hash: 'hashedpassword',
        role: 'user',
        is_locked: true,
        created_at: new Date(),
      };

      (mockDb.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'lockeduser',
          password: 'password123',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Account is locked');
    });
  });
});
