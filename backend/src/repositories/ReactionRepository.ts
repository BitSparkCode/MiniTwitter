import { Pool } from 'pg';
import { IReaction } from '../interfaces/IReaction';

export class ReactionRepository {
  private readonly db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  public async findByPostAndUser(postId: number, userId: number): Promise<IReaction | null> {
    const result = await this.db.query(
      'SELECT * FROM reactions WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  public async findByPostId(postId: number): Promise<IReaction[]> {
    const result = await this.db.query(
      'SELECT * FROM reactions WHERE post_id = $1',
      [postId]
    );
    return result.rows.map((row) => this.mapRow(row));
  }

  public async upsert(postId: number, userId: number, type: IReaction['type']): Promise<IReaction> {
    const result = await this.db.query(
      `INSERT INTO reactions (post_id, user_id, type)
       VALUES ($1, $2, $3)
       ON CONFLICT (post_id, user_id)
       DO UPDATE SET type = EXCLUDED.type
       RETURNING *`,
      [postId, userId, type]
    );
    return this.mapRow(result.rows[0]);
  }

  public async delete(postId: number, userId: number): Promise<void> {
    await this.db.query(
      'DELETE FROM reactions WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );
  }

  protected mapRow(row: Record<string, unknown>): IReaction {
    return {
      id: row.id as number,
      postId: row.post_id as number,
      userId: row.user_id as number,
      type: row.type as IReaction['type'],
      createdAt: row.created_at as Date,
    };
  }
}
