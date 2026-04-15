import { PostRepository } from '../../repositories/PostRepository';
import { Pool } from 'pg';
import { IPost } from '../../interfaces/IPost';

// Mock the database connection
const mockPool = {
  query: jest.fn(),
} as unknown as Pool;

describe('PostRepository', () => {
  let postRepository: PostRepository;

  beforeEach(() => {
    postRepository = new PostRepository(mockPool);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all posts with comment counts', async () => {
      const mockPosts: IPost[] = [
        {
          id: 1,
          userId: 1,
          content: 'First post',
          createdAt: new Date(),
          updatedAt: new Date(),
          commentCount: 3,
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

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: mockPosts.map(post => ({
          ...post,
          user_id: post.userId,
          created_at: post.createdAt,
          updated_at: post.updatedAt,
          comment_count: post.commentCount,
        })),
      });

      const result = await postRepository.findAll();

      expect(mockPool.query).toHaveBeenCalledWith(
        `SELECT p.*, COUNT(c.id)::int AS comment_count
       FROM posts p
       LEFT JOIN comments c ON c.post_id = p.id
       GROUP BY p.id
       ORDER BY p.created_at DESC`
      );
      expect(result).toEqual(mockPosts);
    });
  });

  describe('findById', () => {
    it('should return a post with comment count when found', async () => {
      const mockPost: IPost = {
        id: 1,
        userId: 1,
        content: 'Test post',
        createdAt: new Date(),
        updatedAt: new Date(),
        commentCount: 2,
      };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{
          ...mockPost,
          user_id: mockPost.userId,
          created_at: mockPost.createdAt,
          updated_at: mockPost.updatedAt,
          comment_count: mockPost.commentCount,
        }],
      });

      const result = await postRepository.findById(1);

      expect(mockPool.query).toHaveBeenCalledWith(
        `SELECT p.*, COUNT(c.id)::int AS comment_count
       FROM posts p
       LEFT JOIN comments c ON c.post_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
        [1]
      );
      expect(result).toEqual(mockPost);
    });

    it('should return null when post not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const result = await postRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return posts by user with comment counts', async () => {
      const mockPosts: IPost[] = [
        {
          id: 1,
          userId: 1,
          content: 'User post 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          commentCount: 1,
        },
      ];

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: mockPosts.map(post => ({
          ...post,
          user_id: post.userId,
          created_at: post.createdAt,
          updated_at: post.updatedAt,
          comment_count: post.commentCount,
        })),
      });

      const result = await postRepository.findByUserId(1);

      expect(mockPool.query).toHaveBeenCalledWith(
        `SELECT p.*, COUNT(c.id)::int AS comment_count
       FROM posts p
       LEFT JOIN comments c ON c.post_id = p.id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
        [1]
      );
      expect(result).toEqual(mockPosts);
    });
  });

  describe('create', () => {
    it('should create a new post and return it with comment count', async () => {
      const mockPost: IPost = {
        id: 1,
        userId: 1,
        content: 'New post',
        createdAt: new Date(),
        updatedAt: new Date(),
        commentCount: 0,
      };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{
          ...mockPost,
          user_id: mockPost.userId,
          created_at: mockPost.createdAt,
          updated_at: mockPost.updatedAt,
          comment_count: mockPost.commentCount,
        }],
      });

      const result = await postRepository.create(1, 'New post');

      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *, 0::int AS comment_count',
        [1, 'New post']
      );
      expect(result).toEqual(mockPost);
    });
  });

  describe('update', () => {
    it('should update a post and return it with comment count', async () => {
      const mockPost: IPost = {
        id: 1,
        userId: 1,
        content: 'Updated post',
        createdAt: new Date(),
        updatedAt: new Date(),
        commentCount: 2,
      };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{
          ...mockPost,
          user_id: mockPost.userId,
          created_at: mockPost.createdAt,
          updated_at: mockPost.updatedAt,
          comment_count: mockPost.commentCount,
        }],
      });

      const result = await postRepository.update(1, 'Updated post');

      expect(mockPool.query).toHaveBeenCalledWith(
        `UPDATE posts SET content = $1, updated_at = NOW() WHERE id = $2
       RETURNING *, (SELECT COUNT(id)::int FROM comments WHERE post_id = $2) AS comment_count`,
        ['Updated post', 1]
      );
      expect(result).toEqual(mockPost);
    });

    it('should return null when post not found for update', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const result = await postRepository.update(999, 'Updated content');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a post and return true when successful', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rowCount: 1,
      });

      const result = await postRepository.delete(1);

      expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM posts WHERE id = $1', [1]);
      expect(result).toBeUndefined();
    });

    it('should return false when post not found for deletion', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rowCount: 0,
      });

      const result = await postRepository.delete(999);

      expect(result).toBeUndefined();
    });
  });
});
