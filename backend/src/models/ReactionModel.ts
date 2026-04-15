import { IReaction } from '../interfaces/IReaction';

export class ReactionModel implements IReaction {
  public readonly id: number;
  public readonly postId: number;
  public readonly userId: number;
  public readonly type: 'like' | 'dislike';
  public readonly createdAt: Date;

  constructor(data: IReaction) {
    this.id = data.id;
    this.postId = data.postId;
    this.userId = data.userId;
    this.type = data.type;
    this.createdAt = data.createdAt;
  }
}
