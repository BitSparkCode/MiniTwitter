import { UserController } from '../../controllers/UserController';
import { UserRepository } from '../../repositories/UserRepository';
import { PostRepository } from '../../repositories/PostRepository';
import { CommentRepository } from '../../repositories/CommentRepository';
import { Request, Response } from 'express';

// Mock repositories
const mockUserRepository = {
  findById: jest.fn(),
  findByUsername: jest.fn(),
  create: jest.fn(),
  updateUsername: jest.fn(),
  setLocked: jest.fn(),
  setRole: jest.fn(),
} as unknown as UserRepository;

const mockPostRepository = {
  findByUserId: jest.fn(),
} as unknown as PostRepository;

const mockCommentRepository = {
  findByUserId: jest.fn(),
} as unknown as CommentRepository;

describe('UserController', () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    userController = new UserController(
      mockUserRepository,
      mockPostRepository,
      mockCommentRepository
    );
    
    mockRequest = {
      user: { id: 1, username: 'testuser', role: 'user' },
      body: {},
      params: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('should return current user profile', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      (mockUserRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      await userController.getMe(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user not found', async () => {
      (mockUserRepository.findById as jest.Mock).mockResolvedValue(null);

      await userController.getMe(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('updateMe', () => {
    it('should update username successfully', async () => {
      const mockUpdatedUser = {
        id: 1,
        username: 'newusername',
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      mockRequest.body = { username: 'newusername' };
      (mockUserRepository.updateUsername as jest.Mock).mockResolvedValue(mockUpdatedUser);

      await userController.updateMe(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it('should return 400 when no data provided', async () => {
      mockRequest.body = {};

      await userController.updateMe(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Nothing to update' });
    });

    it('should return 400 for invalid username', async () => {
      mockRequest.body = { username: 'a' }; // Too short

      await userController.updateMe(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.any(Array),
      });
    });

    it('should return 409 when username already taken', async () => {
      mockRequest.body = { username: 'existinguser' };
      (mockUserRepository.updateUsername as jest.Mock).mockRejectedValue({
        code: '23505',
      });

      await userController.updateMe(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username already taken' });
    });

    it('should return 404 when user not found for update', async () => {
      mockRequest.body = { username: 'newusername' };
      (mockUserRepository.updateUsername as jest.Mock).mockResolvedValue(null);

      await userController.updateMe(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('getUser', () => {
    it('should return user profile by ID', async () => {
      const mockUser = {
        id: 2,
        username: 'otheruser',
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      mockRequest.params = { id: '2' };
      (mockUserRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      await userController.getUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user not found', async () => {
      mockRequest.params = { id: '999' };
      (mockUserRepository.findById as jest.Mock).mockResolvedValue(null);

      await userController.getUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('getUserActivity', () => {
    it('should return user posts and comments', async () => {
      const mockPosts = [
        { id: 1, userId: 1, content: 'Post 1', createdAt: new Date(), updatedAt: new Date(), commentCount: 0 },
      ];
      const mockComments = [
        { id: 1, postId: 2, userId: 1, content: 'Comment 1', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockRequest.params = { id: '1' };
      (mockPostRepository.findByUserId as jest.Mock).mockResolvedValue(mockPosts);
      (mockCommentRepository.findByUserId as jest.Mock).mockResolvedValue(mockComments);

      await userController.getUserActivity(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({ posts: mockPosts, comments: mockComments });
    });
  });

  describe('lockUser', () => {
    it('should toggle user lock status', async () => {
      const mockUser = {
        id: 2,
        username: 'lockeduser',
        isLocked: true,
      };

      mockRequest.params = { id: '2' };
      mockRequest.body = { isLocked: true };
      (mockUserRepository.setLocked as jest.Mock).mockResolvedValue(mockUser);

      await userController.lockUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        id: mockUser.id,
        username: mockUser.username,
        isLocked: mockUser.isLocked,
      });
    });

    it('should return 404 when user not found for lock', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { isLocked: true };
      (mockUserRepository.setLocked as jest.Mock).mockResolvedValue(null);

      await userController.lockUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('setUserRole', () => {
    it('should update user role', async () => {
      const mockUser = {
        id: 2,
        username: 'adminuser',
        role: 'admin',
      };

      mockRequest.params = { id: '2' };
      mockRequest.body = { role: 'admin' };
      (mockUserRepository.setRole as jest.Mock).mockResolvedValue(mockUser);

      await userController.setUserRole(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      });
    });

    it('should return 404 when user not found for role change', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { role: 'admin' };
      (mockUserRepository.setRole as jest.Mock).mockResolvedValue(null);

      await userController.setUserRole(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });
});
