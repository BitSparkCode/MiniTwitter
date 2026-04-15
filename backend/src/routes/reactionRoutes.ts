import { Router } from 'express';
import { ReactionController } from '../controllers/ReactionController';
import { createAuthMiddleware } from '../middleware/authMiddleware';
import { UserRepository } from '../repositories/UserRepository';

export function createReactionRouter(
  reactionController: ReactionController,
  userRepository: UserRepository
): Router {
  const router = Router({ mergeParams: true });
  const auth = createAuthMiddleware(userRepository);

  router.post('/', auth, reactionController.upsertReaction);
  router.delete('/', auth, reactionController.deleteReaction);

  return router;
}
