import { CommentController } from '../../controllers/CommentController';
import { CommentService } from '../../services/CommentService';
import { Request, Response } from 'express';
import { NotFoundError, ForbiddenError } from '../../errors';

// Mock CommentService
const mockCommentService = {
  getCommentsByPost: jest.fn(),
  createComment: jest.fn(),
  updateComment: jest.fn(),
  deleteComment: jest.fn(),
} as unknown as CommentService;

describe('CommentController', () => {
  let commentController: CommentController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    commentController = new CommentController(mockCommentService);
    mockRequest = {
      user: { id: 1, username: 'testuser', role: 'user' },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getComments', () => {
    it('should return comments for a post', async () => {
      const mockComments = [
        {
          id: 1,
          postId: 1,
          userId: 1,
          content: 'Test comment',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRequest.params = { postId: '1' };
      (mockCommentService.getCommentsByPost as jest.Mock).mockResolvedValue(mockComments);

      await commentController.getComments(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockCommentService.getCommentsByPost).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(mockComments);
    });

    it('should handle internal server errors', async () => {
      mockRequest.params = { postId: '1' };
      (mockCommentService.getCommentsByPost as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await commentController.getComments(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('createComment', () => {
    it('should create a new comment successfully', async () => {
      const mockComment = {
        id: 1,
        postId: 1,
        userId: 1,
        content: 'New comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.params = { postId: '1' };
      mockRequest.body = { content: 'New comment' };
      (mockCommentService.createComment as jest.Mock).mockResolvedValue(mockComment);

      await commentController.createComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockCommentService.createComment).toHaveBeenCalledWith(1, 1, 'New comment');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockComment);
    });

    it('should return 400 for invalid content', async () => {
      mockRequest.params = { postId: '1' };
      mockRequest.body = { content: '' }; // Empty content

      await commentController.createComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.any(Array),
      });
    });

    it('should handle NotFoundError', async () => {
      mockRequest.params = { postId: '999' };
      mockRequest.body = { content: 'New comment' };
      (mockCommentService.createComment as jest.Mock).mockRejectedValue(
        new NotFoundError('Post not found')
      );

      await commentController.createComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });

    it('should handle internal server errors', async () => {
      mockRequest.params = { postId: '1' };
      mockRequest.body = { content: 'New comment' };
      (mockCommentService.createComment as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await commentController.createComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('updateComment', () => {
    it('should update a comment successfully', async () => {
      const mockComment = {
        id: 1,
        postId: 1,
        userId: 1,
        content: 'Updated comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { content: 'Updated comment' };
      (mockCommentService.updateComment as jest.Mock).mockResolvedValue(mockComment);

      await commentController.updateComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockCommentService.updateComment).toHaveBeenCalledWith(1, 'Updated comment', mockRequest.user);
      expect(mockResponse.json).toHaveBeenCalledWith(mockComment);
    });

    it('should return 400 for invalid content', async () => {
      mockRequest.params = { postId: '1' };
      mockRequest.body = { content: '' }; // Empty content

      await commentController.updateComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.any(Array),
      });
    });

    it('should return 404 when comment not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { content: 'Updated content' };
      (mockCommentService.updateComment as jest.Mock).mockRejectedValue(
        new NotFoundError('Comment not found')
      );

      await commentController.updateComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Comment not found' });
    });

    it('should return 403 when not authorized', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { content: 'Updated content' };
      (mockCommentService.updateComment as jest.Mock).mockRejectedValue(
        new ForbiddenError('Not authorized to update this comment')
      );

      await commentController.updateComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authorized to update this comment' });
    });

    it('should handle internal server errors', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { content: 'Updated content' };
      (mockCommentService.updateComment as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await commentController.updateComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      mockRequest.params = { id: '1' };
      (mockCommentService.deleteComment as jest.Mock).mockResolvedValue(undefined);

      await commentController.deleteComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockCommentService.deleteComment).toHaveBeenCalledWith(1, mockRequest.user);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
    });

    it('should return 404 when comment not found', async () => {
      mockRequest.params = { id: '999' };
      (mockCommentService.deleteComment as jest.Mock).mockRejectedValue(
        new NotFoundError('Comment not found')
      );

      await commentController.deleteComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Comment not found' });
    });

    it('should return 403 when not authorized', async () => {
      mockRequest.params = { id: '1' };
      (mockCommentService.deleteComment as jest.Mock).mockRejectedValue(
        new ForbiddenError('Not authorized to delete this comment')
      );

      await commentController.deleteComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authorized to delete this comment' });
    });

    it('should handle internal server errors', async () => {
      mockRequest.params = { id: '1' };
      (mockCommentService.deleteComment as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await commentController.deleteComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
