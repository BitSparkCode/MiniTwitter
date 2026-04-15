import { Router } from 'express';
import { CommentController } from '../controllers/CommentController';
import { createAuthMiddleware } from '../middleware/authMiddleware';
import { UserRepository } from '../repositories/UserRepository';

export function createCommentRouter(
  commentController: CommentController,
  userRepository: UserRepository
): Router {
  const router = Router({ mergeParams: true });
  const auth = createAuthMiddleware(userRepository);

  router.get('/', auth, commentController.getComments);
  router.post('/', auth, commentController.createComment);

  return router;
}

export function createCommentManageRouter(
  commentController: CommentController,
  userRepository: UserRepository
): Router {
  const router = Router();
  const auth = createAuthMiddleware(userRepository);

  router.put('/:id', auth, commentController.updateComment);
  router.delete('/:id', auth, commentController.deleteComment);

  return router;
}
