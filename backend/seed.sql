-- Seed data for MiniTwitter
-- Default passwords: admin=admin123, moderator=moderator123, alice/bob/charlie=user123

INSERT INTO users (username, password_hash, role) VALUES
  ('admin',     '$2b$10$ARATI2ThglWp69GJRTaNIuv924wMatLNt06dyTy1OyEpAgKRs2T/e', 'admin'),
  ('moderator', '$2b$10$sexqab7bIPBczdtR7ZXFWO2lye.EBDnpcnthZZNBJs.qmjweZ/.Ba', 'moderator'),
  ('alice',     '$2b$10$rVJTewaGj2iQe0WrNv5pluaB2AA2IhXW.OZiWZ1SowvaDunS9PYdG', 'user'),
  ('bob',       '$2b$10$rVJTewaGj2iQe0WrNv5pluaB2AA2IhXW.OZiWZ1SowvaDunS9PYdG', 'user'),
  ('charlie',   '$2b$10$rVJTewaGj2iQe0WrNv5pluaB2AA2IhXW.OZiWZ1SowvaDunS9PYdG', 'user');

INSERT INTO posts (user_id, content) VALUES
  (3, 'Hello everyone! Just joined MiniTwitter 🐣'),
  (4, 'What a great day to post something!'),
  (5, 'Anyone else loving this platform so far?'),
  (3, 'TypeScript is amazing for large projects.'),
  (4, 'Hot take: dark mode is always better.'),
  (5, 'Just had the best coffee of my life ☕'),
  (1, 'Welcome to MiniTwitter! Feel free to post and interact.'),
  (2, 'Reminder: keep it friendly and constructive 👍');

INSERT INTO comments (post_id, user_id, content) VALUES
  (1, 4, 'Welcome, Alice! Great to have you here.'),
  (1, 5, 'Hey Alice! Looking forward to your posts.'),
  (2, 3, 'Same here, Bob! Beautiful weather today.'),
  (3, 4, 'Absolutely loving it!'),
  (3, 1, 'Glad to hear it, Charlie!'),
  (4, 5, 'Agreed! TypeScript saves so much debugging time.'),
  (4, 4, 'Couldn''t agree more. Strict mode is a lifesaver.'),
  (5, 3, 'Hard agree on the dark mode 🌙'),
  (5, 5, 'Light mode users, where are you?'),
  (7, 3, 'Thanks for the warm welcome, admin!'),
  (7, 4, 'This platform is really cool.');

INSERT INTO reactions (post_id, user_id, type) VALUES
  (1, 4, 'like'),
  (1, 5, 'like'),
  (1, 2, 'like'),
  (2, 3, 'like'),
  (2, 5, 'like'),
  (3, 4, 'like'),
  (4, 5, 'like'),
  (4, 4, 'like'),
  (5, 3, 'like'),
  (5, 5, 'dislike'),
  (6, 1, 'like'),
  (6, 4, 'like'),
  (7, 3, 'like'),
  (7, 4, 'like'),
  (7, 5, 'like'),
  (8, 3, 'like');
