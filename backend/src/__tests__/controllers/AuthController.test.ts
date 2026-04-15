import { AuthController } from '../../controllers/AuthController';
import { AuthService } from '../../services/AuthService';
import { Request, Response } from 'express';
import { UnauthorizedError, ConflictError } from '../../errors';

// Mock AuthService
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
} as unknown as AuthService;

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    authController = new AuthController(mockAuthService);
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'newuser',
        role: 'user',
        createdAt: new Date(),
      };

      mockRequest.body = {
        username: 'newuser',
        password: 'password123',
      };

      (mockAuthService.register as jest.Mock).mockResolvedValue(mockUser);

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockAuthService.register).toHaveBeenCalledWith('newuser', 'password123');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      });
    });

    it('should return 400 for invalid input', async () => {
      mockRequest.body = {
        username: 'a', // Too short
        password: '123', // Too short
      };

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.any(Array),
      });
    });

    it('should return 409 when username already exists', async () => {
      mockRequest.body = {
        username: 'existinguser',
        password: 'password123',
      };

      (mockAuthService.register as jest.Mock).mockRejectedValue(
        new ConflictError('Username already taken')
      );

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username already taken' });
    });

    it('should handle internal server errors', async () => {
      mockRequest.body = {
        username: 'newuser',
        password: 'password123',
      };

      (mockAuthService.register as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockToken = 'mock-jwt-token';

      mockRequest.body = {
        username: 'testuser',
        password: 'password123',
      };

      (mockAuthService.login as jest.Mock).mockResolvedValue(mockToken);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockAuthService.login).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockResponse.json).toHaveBeenCalledWith({ token: mockToken });
    });

    it('should return 400 for invalid input', async () => {
      mockRequest.body = {
        username: '', // Empty
        password: '', // Empty
      };

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.any(Array),
      });
    });

    it('should return 401 for invalid credentials', async () => {
      mockRequest.body = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      (mockAuthService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedError('Invalid credentials')
      );

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should handle internal server errors', async () => {
      mockRequest.body = {
        username: 'testuser',
        password: 'password123',
      };

      (mockAuthService.login as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('logout', () => {
    it('should return 200 on logout', async () => {
      await authController.logout(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });
});
