import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { createAuthMiddleware } from '../middleware/authMiddleware';
import { UserRepository } from '../repositories/UserRepository';

export function createAuthRouter(
  authController: AuthController,
  userRepository: UserRepository
): Router {
  const router = Router();
  const auth = createAuthMiddleware(userRepository);

  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.post('/logout', auth, authController.logout);

  return router;
}
