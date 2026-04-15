import { Pool } from 'pg';
import { IComment } from '../interfaces/IComment';

export class CommentRepository {
  private readonly db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  public async findByPostId(postId: number): Promise<IComment[]> {
    const result = await this.db.query(
      'SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC',
      [postId]
    );
    return result.rows.map((row) => this.mapRow(row));
  }

  public async findById(id: number): Promise<IComment | null> {
    const result = await this.db.query('SELECT * FROM comments WHERE id = $1', [id]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  public async findByUserId(userId: number): Promise<IComment[]> {
    const result = await this.db.query(
      'SELECT * FROM comments WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map((row) => this.mapRow(row));
  }

  public async create(postId: number, userId: number, content: string): Promise<IComment> {
    const result = await this.db.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [postId, userId, content]
    );
    return this.mapRow(result.rows[0]);
  }

  public async update(id: number, content: string): Promise<IComment | null> {
    const result = await this.db.query(
      'UPDATE comments SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [content, id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  public async delete(id: number): Promise<void> {
    await this.db.query('DELETE FROM comments WHERE id = $1', [id]);
  }

  protected mapRow(row: Record<string, unknown>): IComment {
    return {
      id: row.id as number,
      postId: row.post_id as number,
      userId: row.user_id as number,
      content: row.content as string,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    };
  }
}
