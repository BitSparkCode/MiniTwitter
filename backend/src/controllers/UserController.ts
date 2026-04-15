import { Request, Response } from 'express';
import { z } from 'zod';
import { UserRepository } from '../repositories/UserRepository';
import { PostRepository } from '../repositories/PostRepository';
import { CommentRepository } from '../repositories/CommentRepository';
import { AppError, NotFoundError, BadRequestError } from '../errors';
import { IUser } from '../interfaces/IUser';

const updateMeSchema = z.object({
  username: z.string().min(3).max(50).optional(),
});

const lockSchema = z.object({
  isLocked: z.boolean(),
});

const roleSchema = z.object({
  role: z.enum(['user', 'moderator', 'admin']),
});

export class UserController {
  private readonly userRepository: UserRepository;
  private readonly postRepository: PostRepository;
  private readonly commentRepository: CommentRepository;

  constructor(
    userRepository: UserRepository,
    postRepository: PostRepository,
    commentRepository: CommentRepository
  ) {
    this.userRepository = userRepository;
    this.postRepository = postRepository;
    this.commentRepository = commentRepository;
  }

  public getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userRepository.findById(req.user!.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json({ id: user.id, username: user.username, role: user.role, createdAt: user.createdAt });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  public updateMe = async (req: Request, res: Response): Promise<void> => {
    const parsed = updateMeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors });
      return;
    }
    try {
      if (!parsed.data.username) {
        res.status(400).json({ error: 'Nothing to update' });
        return;
      }
      const updated = await this.userRepository.updateUsername(req.user!.id, parsed.data.username);
      if (!updated) throw new NotFoundError('User not found');
      res.json({ id: updated.id, username: updated.username, role: updated.role });
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
      } else if ((err as { code?: string }).code === '23505') {
        res.status(409).json({ error: 'Username already taken' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  public getUserActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number(req.params.id);
      const [posts, comments] = await Promise.all([
        this.postRepository.findByUserId(userId),
        this.commentRepository.findByUserId(userId),
      ]);
      res.json({ posts, comments });
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  public lockUser = async (req: Request, res: Response): Promise<void> => {
    const parsed = lockSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors });
      return;
    }
    try {
      const updated = await this.userRepository.setLocked(Number(req.params.id), parsed.data.isLocked);
      if (!updated) throw new NotFoundError('User not found');
      res.json({ id: updated.id, username: updated.username, isLocked: updated.isLocked });
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  public setUserRole = async (req: Request, res: Response): Promise<void> => {
    const parsed = roleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors });
      return;
    }
    try {
      const updated = await this.userRepository.setRole(
        Number(req.params.id),
        parsed.data.role as IUser['role']
      );
      if (!updated) throw new NotFoundError('User not found');
      res.json({ id: updated.id, username: updated.username, role: updated.role });
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
