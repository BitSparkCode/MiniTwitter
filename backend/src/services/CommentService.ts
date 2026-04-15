import { CommentRepository } from '../repositories/CommentRepository';
import { PostRepository } from '../repositories/PostRepository';
import { IComment } from '../interfaces/IComment';
import { IUser } from '../interfaces/IUser';
import { NotFoundError, ForbiddenError } from '../errors';

export class CommentService {
  private readonly commentRepository: CommentRepository;
  private readonly postRepository: PostRepository;

  constructor(commentRepository: CommentRepository, postRepository: PostRepository) {
    this.commentRepository = commentRepository;
    this.postRepository = postRepository;
  }

  public async getCommentsByPost(postId: number): Promise<IComment[]> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundError('Post not found');
    return this.commentRepository.findByPostId(postId);
  }

  public async createComment(postId: number, userId: number, content: string): Promise<IComment> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundError('Post not found');
    return this.commentRepository.create(postId, userId, content);
  }

  public async updateComment(
    commentId: number,
    content: string,
    requestingUser: IUser
  ): Promise<IComment> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new NotFoundError('Comment not found');

    const isOwner = comment.userId === requestingUser.id;
    const isModerator = ['moderator', 'admin'].includes(requestingUser.role);

    if (!isOwner && !isModerator) {
      throw new ForbiddenError('Not authorized to update this comment');
    }

    const updated = await this.commentRepository.update(commentId, content);
    if (!updated) throw new NotFoundError('Comment not found');
    return updated;
  }

  public async deleteComment(commentId: number, requestingUser: IUser): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new NotFoundError('Comment not found');

    const isOwner = comment.userId === requestingUser.id;
    const isModerator = ['moderator', 'admin'].includes(requestingUser.role);

    if (!isOwner && !isModerator) {
      throw new ForbiddenError('Not authorized to delete this comment');
    }

    await this.commentRepository.delete(commentId);
  }
}
