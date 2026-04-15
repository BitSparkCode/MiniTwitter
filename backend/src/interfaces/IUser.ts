export interface IUser {
  id: number;
  username: string;
  passwordHash: string;
  role: 'user' | 'moderator' | 'admin';
  isLocked: boolean;
  createdAt: Date;
}
