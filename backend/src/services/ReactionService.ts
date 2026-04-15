import { ReactionRepository } from '../repositories/ReactionRepository';
import { PostRepository } from '../repositories/PostRepository';
import { IReaction } from '../interfaces/IReaction';
import { NotFoundError } from '../errors';

export class ReactionService {
  private readonly reactionRepository: ReactionRepository;
  private readonly postRepository: PostRepository;

  constructor(reactionRepository: ReactionRepository, postRepository: PostRepository) {
    this.reactionRepository = reactionRepository;
    this.postRepository = postRepository;
  }

  public async upsertReaction(
    postId: number,
    userId: number,
    type: IReaction['type']
  ): Promise<IReaction> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundError('Post not found');
    return this.reactionRepository.upsert(postId, userId, type);
  }

  public async deleteReaction(postId: number, userId: number): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundError('Post not found');
    await this.reactionRepository.delete(postId, userId);
  }
}
