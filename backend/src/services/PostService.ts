import { PostRepository } from '../repositories/PostRepository';
import { IPost } from '../interfaces/IPost';
import { IUser } from '../interfaces/IUser';
import { NotFoundError, ForbiddenError } from '../errors';

export class PostService {
  private readonly postRepository: PostRepository;

  constructor(postRepository: PostRepository) {
    this.postRepository = postRepository;
  }

  public async getAllPosts(): Promise<IPost[]> {
    return this.postRepository.findAll();
  }

  public async createPost(userId: number, content: string): Promise<IPost> {
    return this.postRepository.create(userId, content);
  }

  public async updatePost(postId: number, content: string, requestingUser: IUser): Promise<IPost> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundError('Post not found');

    const isOwner = post.userId === requestingUser.id;
    const isModerator = ['moderator', 'admin'].includes(requestingUser.role);

    if (!isOwner && !isModerator) {
      throw new ForbiddenError('Not authorized to update this post');
    }

    const updated = await this.postRepository.update(postId, content);
    if (!updated) throw new NotFoundError('Post not found');
    return updated;
  }

  public async deletePost(postId: number, requestingUser: IUser): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundError('Post not found');

    const isOwner = post.userId === requestingUser.id;
    const isModerator = ['moderator', 'admin'].includes(requestingUser.role);

    if (!isOwner && !isModerator) {
      throw new ForbiddenError('Not authorized to delete this post');
    }

    await this.postRepository.delete(postId);
  }
}
