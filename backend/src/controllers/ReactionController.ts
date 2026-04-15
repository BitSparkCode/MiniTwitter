import { Request, Response } from 'express';
import { z } from 'zod';
import { ReactionService } from '../services/ReactionService';
import { AppError } from '../errors';

const reactionSchema = z.object({
  type: z.enum(['like', 'dislike']),
});

export class ReactionController {
  private readonly reactionService: ReactionService;

  constructor(reactionService: ReactionService) {
    this.reactionService = reactionService;
  }

  public upsertReaction = async (req: Request, res: Response): Promise<void> => {
    const parsed = reactionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors });
      return;
    }
    try {
      const reaction = await this.reactionService.upsertReaction(
        Number(req.params.postId),
        req.user!.id,
        parsed.data.type
      );
      res.status(200).json(reaction);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  public deleteReaction = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.reactionService.deleteReaction(Number(req.params.postId), req.user!.id);
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
