import express from 'express';
import cors from 'cors';
import pool from './config/db';

import { UserRepository } from './repositories/UserRepository';
import { PostRepository } from './repositories/PostRepository';
import { CommentRepository } from './repositories/CommentRepository';
import { ReactionRepository } from './repositories/ReactionRepository';

import { AuthService } from './services/AuthService';
import { PostService } from './services/PostService';
import { CommentService } from './services/CommentService';
import { ReactionService } from './services/ReactionService';

import { AuthController } from './controllers/AuthController';
import { PostController } from './controllers/PostController';
import { CommentController } from './controllers/CommentController';
import { ReactionController } from './controllers/ReactionController';
import { UserController } from './controllers/UserController';

import { createAuthRouter } from './routes/authRoutes';
import { createPostRouter } from './routes/postRoutes';
import { createCommentRouter, createCommentManageRouter } from './routes/commentRoutes';
import { createReactionRouter } from './routes/reactionRoutes';
import { createUserRouter } from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT ?? 3000;
const JWT_SECRET = process.env.JWT_SECRET ?? '';

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

const userRepository = new UserRepository(pool);
const postRepository = new PostRepository(pool);
const commentRepository = new CommentRepository(pool);
const reactionRepository = new ReactionRepository(pool);

const authService = new AuthService(userRepository, JWT_SECRET);
const postService = new PostService(postRepository);
const commentService = new CommentService(commentRepository, postRepository);
const reactionService = new ReactionService(reactionRepository, postRepository);

const authController = new AuthController(authService);
const postController = new PostController(postService);
const commentController = new CommentController(commentService);
const reactionController = new ReactionController(reactionService);
const userController = new UserController(userRepository, postRepository, commentRepository);

app.use('/api/auth', createAuthRouter(authController, userRepository));
app.use('/api/posts', createPostRouter(postController, userRepository));
app.use(
  '/api/posts/:postId/comments',
  createCommentRouter(commentController, userRepository)
);
app.use('/api/comments', createCommentManageRouter(commentController, userRepository));
app.use(
  '/api/posts/:postId/reactions',
  createReactionRouter(reactionController, userRepository)
);
app.use('/api/users', createUserRouter(userController, userRepository));

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
