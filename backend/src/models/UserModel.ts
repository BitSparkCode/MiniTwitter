import { IUser } from '../interfaces/IUser';

export class UserModel implements IUser {
  public readonly id: number;
  public readonly username: string;
  public readonly passwordHash: string;
  public readonly role: 'user' | 'moderator' | 'admin';
  public readonly isLocked: boolean;
  public readonly createdAt: Date;

  constructor(data: IUser) {
    this.id = data.id;
    this.username = data.username;
    this.passwordHash = data.passwordHash;
    this.role = data.role;
    this.isLocked = data.isLocked;
    this.createdAt = data.createdAt;
  }
}
