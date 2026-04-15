import { IPost } from '../interfaces/IPost';

export class PostModel implements IPost {
  public readonly id: number;
  public readonly userId: number;
  public readonly content: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: IPost) {
    this.id = data.id;
    this.userId = data.userId;
    this.content = data.content;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
