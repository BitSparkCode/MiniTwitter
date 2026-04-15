import { Pool } from 'pg';
import { IPost } from '../interfaces/IPost';

export class PostRepository {
  private readonly db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  public async findAll(): Promise<IPost[]> {
    const result = await this.db.query(
      `SELECT p.*, COUNT(c.id)::int AS comment_count
       FROM posts p
       LEFT JOIN comments c ON c.post_id = p.id
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );
    return result.rows.map((row) => this.mapRow(row));
  }

  public async findById(id: number): Promise<IPost | null> {
    const result = await this.db.query(
      `SELECT p.*, COUNT(c.id)::int AS comment_count
       FROM posts p
       LEFT JOIN comments c ON c.post_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  public async findByUserId(userId: number): Promise<IPost[]> {
    const result = await this.db.query(
      `SELECT p.*, COUNT(c.id)::int AS comment_count
       FROM posts p
       LEFT JOIN comments c ON c.post_id = p.id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return result.rows.map((row) => this.mapRow(row));
  }

  public async create(userId: number, content: string): Promise<IPost> {
    const result = await this.db.query(
      'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *, 0::int AS comment_count',
      [userId, content]
    );
    return this.mapRow(result.rows[0]);
  }

  public async update(id: number, content: string): Promise<IPost | null> {
    const result = await this.db.query(
      `UPDATE posts SET content = $1, updated_at = NOW() WHERE id = $2
       RETURNING *, (SELECT COUNT(id)::int FROM comments WHERE post_id = $2) AS comment_count`,
      [content, id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  public async delete(id: number): Promise<void> {
    await this.db.query('DELETE FROM posts WHERE id = $1', [id]);
  }

  protected mapRow(row: Record<string, unknown>): IPost {
    return {
      id: row.id as number,
      userId: row.user_id as number,
      content: row.content as string,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
      commentCount: (row.comment_count as number) ?? 0,
    };
  }
}
