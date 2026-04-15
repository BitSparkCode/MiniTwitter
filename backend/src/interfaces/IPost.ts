export interface IPost {
  id: number;
  userId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  commentCount: number;
}
