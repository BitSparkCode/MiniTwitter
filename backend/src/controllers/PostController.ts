import { Request, Response } from 'express';
import { z } from 'zod';
import { PostService } from '../services/PostService';
import { AppError } from '../errors';
import { IUser } from '../interfaces/IUser';

const createPostSchema = z.object({
  content: z.string().min(1).max(280),
});

const updatePostSchema = z.object({
  content: z.string().min(1).max(280),
});

export class PostController {
  private readonly postService: PostService;

  constructor(postService: PostService) {
    this.postService = postService;
  }

  public getPosts = async (_req: Request, res: Response): Promise<void> => {
    try {
      const posts = await this.postService.getAllPosts();
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  public createPost = async (req: Request, res: Response): Promise<void> => {
    const parsed = createPostSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors });
      return;
    }
    try {
      const post = await this.postService.createPost(req.user!.id, parsed.data.content);
      res.status(201).json(post);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  public updatePost = async (req: Request, res: Response): Promise<void> => {
    const parsed = updatePostSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors });
      return;
    }
    try {
      const post = await this.postService.updatePost(
        Number(req.params.id),
        parsed.data.content,
        req.user as IUser
      );
      res.json(post);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  public deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.postService.deletePost(Number(req.params.id), req.user as IUser);
      res.status(204).send();
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
