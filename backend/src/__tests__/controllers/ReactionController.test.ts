import { ReactionController } from '../../controllers/ReactionController';
import { ReactionService } from '../../services/ReactionService';
import { Request, Response } from 'express';
import { NotFoundError } from '../../errors';

// Mock ReactionService
const mockReactionService = {
  upsertReaction: jest.fn(),
  deleteReaction: jest.fn(),
} as unknown as ReactionService;

describe('ReactionController', () => {
  let reactionController: ReactionController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    reactionController = new ReactionController(mockReactionService);
    mockRequest = {
      user: { id: 1, username: 'testuser', role: 'user' },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  describe('upsertReaction', () => {
    it('should upsert a reaction successfully', async () => {
      const mockReaction = {
        id: 1,
        postId: 1,
        userId: 1,
        type: 'like' as const,
        createdAt: new Date(),
      };

      mockRequest.params = { postId: '1' };
      mockRequest.body = { type: 'like' };
      (mockReactionService.upsertReaction as jest.Mock).mockResolvedValue(mockReaction);

      await reactionController.upsertReaction(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockReactionService.upsertReaction).toHaveBeenCalledWith(1, 1, 'like');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockReaction);
    });

    it('should return 400 for invalid reaction type', async () => {
      mockRequest.params = { postId: '1' };
      mockRequest.body = { type: 'invalid' };

      await reactionController.upsertReaction(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.any(Array),
      });
    });

    it('should return 404 when post not found', async () => {
      mockRequest.params = { postId: '999' };
      mockRequest.body = { type: 'like' };
      (mockReactionService.upsertReaction as jest.Mock).mockRejectedValue(
        new NotFoundError('Post not found')
      );

      await reactionController.upsertReaction(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });

    it('should handle internal server errors', async () => {
      mockRequest.params = { postId: '1' };
      mockRequest.body = { type: 'like' };
      (mockReactionService.upsertReaction as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await reactionController.upsertReaction(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('deleteReaction', () => {
    it('should delete a reaction successfully', async () => {
      mockRequest.params = { postId: '1' };
      (mockReactionService.deleteReaction as jest.Mock).mockResolvedValue(undefined);

      await reactionController.deleteReaction(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockReactionService.deleteReaction).toHaveBeenCalledWith(1, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 404 when post not found', async () => {
      mockRequest.params = { postId: '1' };
      (mockReactionService.deleteReaction as jest.Mock).mockRejectedValue(
        new NotFoundError('Post not found')
      );

      await reactionController.deleteReaction(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });

    it('should handle internal server errors', async () => {
      mockRequest.params = { postId: '1' };
      (mockReactionService.deleteReaction as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await reactionController.deleteReaction(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
