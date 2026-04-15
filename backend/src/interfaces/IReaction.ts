export interface IReaction {
  id: number;
  postId: number;
  userId: number;
  type: 'like' | 'dislike';
  createdAt: Date;
}
