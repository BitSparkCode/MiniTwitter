import { IComment } from '../interfaces/IComment';

export class CommentModel implements IComment {
  public readonly id: number;
  public readonly postId: number;
  public readonly userId: number;
  public readonly content: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: IComment) {
    this.id = data.id;
    this.postId = data.postId;
    this.userId = data.userId;
    this.content = data.content;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
