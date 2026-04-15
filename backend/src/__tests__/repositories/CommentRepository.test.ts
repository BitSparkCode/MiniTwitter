import { CommentRepository } from '../../repositories/CommentRepository';
import { Pool } from 'pg';
import { IComment } from '../../interfaces/IComment';

// Mock the database connection
const mockPool = {
  query: jest.fn(),
} as unknown as Pool;

describe('CommentRepository', () => {
  let commentRepository: CommentRepository;

  beforeEach(() => {
    commentRepository = new CommentRepository(mockPool);
    jest.clearAllMocks();
  });

  describe('findByPostId', () => {
    it('should return all comments for a post', async () => {
      const mockComments: IComment[] = [
        {
          id: 1,
          postId: 1,
          userId: 1,
          content: 'First comment',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          postId: 1,
          userId: 2,
          content: 'Second comment',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: mockComments.map(comment => ({
          ...comment,
          post_id: comment.postId,
          user_id: comment.userId,
          created_at: comment.createdAt,
          updated_at: comment.updatedAt,
        })),
      });

      const result = await commentRepository.findByPostId(1);

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC',
        [1]
      );
      expect(result).toEqual(mockComments);
    });

    it('should return empty array when no comments found for post', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const result = await commentRepository.findByPostId(999);

      expect(result).toEqual([]);
    });
  });

  describe('findByUserId', () => {
    it('should return all comments by a user', async () => {
      const mockComments: IComment[] = [
        {
          id: 1,
          postId: 1,
          userId: 1,
          content: 'User comment 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: mockComments.map(comment => ({
          ...comment,
          post_id: comment.postId,
          user_id: comment.userId,
          created_at: comment.createdAt,
          updated_at: comment.updatedAt,
        })),
      });

      const result = await commentRepository.findByUserId(1);

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM comments WHERE user_id = $1 ORDER BY created_at DESC',
        [1]
      );
      expect(result).toEqual(mockComments);
    });
  });

  describe('create', () => {
    it('should create a new comment and return it', async () => {
      const mockComment: IComment = {
        id: 1,
        postId: 1,
        userId: 1,
        content: 'New comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{
          ...mockComment,
          post_id: mockComment.postId,
          user_id: mockComment.userId,
          created_at: mockComment.createdAt,
          updated_at: mockComment.updatedAt,
        }],
      });

      const result = await commentRepository.create(1, 1, 'New comment');

      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
        [1, 1, 'New comment']
      );
      expect(result).toEqual(mockComment);
    });
  });

  describe('update', () => {
    it('should update a comment and return it', async () => {
      const mockComment: IComment = {
        id: 1,
        postId: 1,
        userId: 1,
        content: 'Updated comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{
          ...mockComment,
          post_id: mockComment.postId,
          user_id: mockComment.userId,
          created_at: mockComment.createdAt,
          updated_at: mockComment.updatedAt,
        }],
      });

      const result = await commentRepository.update(1, 'Updated comment');

      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE comments SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        ['Updated comment', 1]
      );
      expect(result).toEqual(mockComment);
    });

    it('should return null when comment not found for update', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const result = await commentRepository.update(999, 'Updated content');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a comment and return undefined when successful', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rowCount: 1,
      });

      const result = await commentRepository.delete(1);

      expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM comments WHERE id = $1', [1]);
      expect(result).toBeUndefined();
    });

    it('should return undefined when comment not found for deletion', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rowCount: 0,
      });

      const result = await commentRepository.delete(999);

      expect(result).toBeUndefined();
    });
  });
});
