import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { createAuthMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { UserRepository } from '../repositories/UserRepository';

export function createUserRouter(
  userController: UserController,
  userRepository: UserRepository
): Router {
  const router = Router();
  const auth = createAuthMiddleware(userRepository);

  router.get('/me', auth, userController.getMe);
  router.put('/me', auth, userController.updateMe);
  router.get('/:id/activity', auth, userController.getUserActivity);
  router.put('/:id/lock', auth, requireRole('admin'), userController.lockUser);
  router.put('/:id/role', auth, requireRole('admin'), userController.setUserRole);

  return router;
}
