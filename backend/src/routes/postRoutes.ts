import { Router } from 'express';
import { PostController } from '../controllers/PostController';
import { createAuthMiddleware } from '../middleware/authMiddleware';
import { UserRepository } from '../repositories/UserRepository';

export function createPostRouter(
  postController: PostController,
  userRepository: UserRepository
): Router {
  const router = Router();
  const auth = createAuthMiddleware(userRepository);

  router.get('/', auth, postController.getPosts);
  router.post('/', auth, postController.createPost);
  router.put('/:id', auth, postController.updatePost);
  router.delete('/:id', auth, postController.deletePost);

  return router;
}
