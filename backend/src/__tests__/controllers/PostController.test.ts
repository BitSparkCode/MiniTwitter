import { PostController } from '../../controllers/PostController';
import { PostService } from '../../services/PostService';
import { Request, Response } from 'express';
import { NotFoundError } from '../../errors';

// Mock PostService
const mockPostService = {
  getAllPosts: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
} as unknown as PostService;

describe('PostController', () => {
  let postController: PostController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    postController = new PostController(mockPostService);
    
    mockRequest = {
      user: { id: 1, username: 'testuser', role: 'user' },
      body: {},
      params: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('getPosts', () => {
    it('should return all posts', async () => {
      const mockPosts = [
        {
          id: 1,
          userId: 1,
          content: 'First post',
          createdAt: new Date(),
          updatedAt: new Date(),
          commentCount: 2,
        },
        {
          id: 2,
          userId: 2,
          content: 'Second post',
          createdAt: new Date(),
          updatedAt: new Date(),
          commentCount: 1,
        },
      ];

      (mockPostService.getAllPosts as jest.Mock).mockResolvedValue(mockPosts);

      await postController.getPosts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockPosts);
    });

    it('should handle internal server errors', async () => {
      (mockPostService.getAllPosts as jest.Mock).mockRejectedValue(new Error('DB error'));

      await postController.getPosts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('createPost', () => {
    it('should create a new post successfully', async () => {
      const mockPost = {
        id: 1,
        userId: 1,
        content: 'New post',
        createdAt: new Date(),
        updatedAt: new Date(),
        commentCount: 0,
      };

      mockRequest.body = { content: 'New post' };
      (mockPostService.createPost as jest.Mock).mockResolvedValue(mockPost);

      await postController.createPost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPostService.createPost).toHaveBeenCalledWith(1, 'New post');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPost);
    });

    it('should return 400 for invalid post content', async () => {
      mockRequest.body = { content: '' }; // Empty content

      await postController.createPost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.any(Array),
      });
    });

    it('should return 400 for content too long', async () => {
      mockRequest.body = { content: 'a'.repeat(281) }; // Over 280 chars

      await postController.createPost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.any(Array),
      });
    });
  });

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      const mockPost = {
        id: 1,
        userId: 1,
        content: 'Updated post',
        createdAt: new Date(),
        updatedAt: new Date(),
        commentCount: 1,
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { content: 'Updated post' };
      (mockPostService.updatePost as jest.Mock).mockResolvedValue(mockPost);

      await postController.updatePost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPostService.updatePost).toHaveBeenCalledWith(1, 'Updated post', mockRequest.user);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPost);
    });

    it('should return 400 for invalid update content', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { content: '' };

      await postController.updatePost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.any(Array),
      });
    });

    it('should return 404 when post not found for update', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { content: 'Updated content' };
      (mockPostService.updatePost as jest.Mock).mockRejectedValue(new NotFoundError('Post not found'));

      await postController.updatePost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      mockRequest.params = { id: '1' };
      (mockPostService.deletePost as jest.Mock).mockResolvedValue(undefined);

      await postController.deletePost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPostService.deletePost).toHaveBeenCalledWith(1, mockRequest.user);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 404 when post not found for deletion', async () => {
      mockRequest.params = { id: '999' };
      (mockPostService.deletePost as jest.Mock).mockRejectedValue(new NotFoundError('Post not found'));

      await postController.deletePost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });
  });
});
