import { Request, Response } from 'express';
import { z } from 'zod';
import { CommentService } from '../services/CommentService';
import { AppError } from '../errors';
import { IUser } from '../interfaces/IUser';

const commentSchema = z.object({
  content: z.string().min(1),
});

export class CommentController {
  private readonly commentService: CommentService;

  constructor(commentService: CommentService) {
    this.commentService = commentService;
  }

  public getComments = async (req: Request, res: Response): Promise<void> => {
    try {
      const comments = await this.commentService.getCommentsByPost(Number(req.params.postId));
      res.json(comments);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  public createComment = async (req: Request, res: Response): Promise<void> => {
    const parsed = commentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors });
      return;
    }
    try {
      const comment = await this.commentService.createComment(
        Number(req.params.postId),
        req.user!.id,
        parsed.data.content
      );
      res.status(201).json(comment);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  public updateComment = async (req: Request, res: Response): Promise<void> => {
    const parsed = commentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors });
      return;
    }
    try {
      const comment = await this.commentService.updateComment(
        Number(req.params.id),
        parsed.data.content,
        req.user as IUser
      );
      res.json(comment);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  public deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.commentService.deleteComment(Number(req.params.id), req.user as IUser);
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
