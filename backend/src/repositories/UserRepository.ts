import { Pool } from 'pg';
import { IUser } from '../interfaces/IUser';

export class UserRepository {
  private readonly db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  public async findById(id: number): Promise<IUser | null> {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  public async findByUsername(username: string): Promise<IUser | null> {
    const result = await this.db.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  public async create(username: string, passwordHash: string): Promise<IUser> {
    const result = await this.db.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *',
      [username, passwordHash]
    );
    return this.mapRow(result.rows[0]);
  }

  public async updateUsername(id: number, username: string): Promise<IUser | null> {
    const result = await this.db.query(
      'UPDATE users SET username = $1 WHERE id = $2 RETURNING *',
      [username, id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  public async setLocked(id: number, isLocked: boolean): Promise<IUser | null> {
    const result = await this.db.query(
      'UPDATE users SET is_locked = $1 WHERE id = $2 RETURNING *',
      [isLocked, id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  public async setRole(id: number, role: IUser['role']): Promise<IUser | null> {
    const result = await this.db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
      [role, id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  protected mapRow(row: Record<string, unknown>): IUser {
    return {
      id: row.id as number,
      username: row.username as string,
      passwordHash: row.password_hash as string,
      role: row.role as IUser['role'],
      isLocked: row.is_locked as boolean,
      createdAt: row.created_at as Date,
    };
  }
}
