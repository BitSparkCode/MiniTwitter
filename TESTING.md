# Testing

![Jest](https://img.shields.io/badge/Tests-87%20passing-C21325?logo=jest&logoColor=white)
![Coverage](https://img.shields.io/badge/Coverage-55%25-yellow?logo=jest&logoColor=white)
![Test Suites](https://img.shields.io/badge/Suites-9%20passing-brightgreen)

Backend-only test suite using **Jest** + **Supertest** + **ts-jest**.  
Frontend has no tests by design.

---

## Running Tests

All commands are run from the `backend/` directory:

```bash
cd backend

# Run all tests
npm test

# Run with verbose output
npm test -- --verbose

# Watch mode (re-runs on file change)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

> Tests run entirely in memory — no database or Docker required.

---

## Test Results

```
Test Suites: 9 passed, 9 total
Tests:       87 passed, 87 total
Time:        ~3.5s
```

---

## Coverage Summary

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| `controllers/AuthController.ts` | 100% | 100% | 100% | 100% |
| `controllers/CommentController.ts` | 97% | 90% | 100% | 97% |
| `controllers/PostController.ts` | 87% | 62% | 100% | 87% |
| `controllers/ReactionController.ts` | 100% | 100% | 100% | 100% |
| `controllers/UserController.ts` | 84% | 63% | 100% | 83% |
| `repositories/PostRepository.ts` | 100% | 83% | 100% | 100% |
| `repositories/UserRepository.ts` | 100% | 80% | 100% | 100% |
| `repositories/CommentRepository.ts` | 87% | 50% | 90% | 85% |
| `services/AuthService.ts` | 95% | 75% | 100% | 95% |

---

## Test Structure

```
backend/src/__tests__/
├── controllers/
│   ├── AuthController.test.ts       # register, login, logout
│   ├── CommentController.test.ts    # getComments, createComment, updateComment, deleteComment
│   ├── PostController.test.ts       # getPosts, createPost, updatePost, deletePost
│   ├── ReactionController.test.ts   # upsertReaction, deleteReaction
│   └── UserController.test.ts       # getMe, updateMe, getUser, getUserActivity, lockUser, setUserRole
├── repositories/
│   ├── CommentRepository.test.ts    # findByPostId, findByUserId, create, update, delete
│   ├── PostRepository.test.ts       # findAll, findById, findByUserId, create, update, delete
│   └── UserRepository.test.ts       # findById, findByUsername, create, updateUsername, setLocked, setRole
└── integration/
    └── auth.test.ts                 # POST /api/auth/register, POST /api/auth/login (full HTTP stack)
```

---

## Test Design

### Unit Tests — Controllers
- Each controller is tested with a **mocked service/repository** injected via constructor
- Covers: success paths, validation errors (400), not found (404), forbidden (403), conflict (409), server errors (500)
- Uses `jest.fn()` mocks; no real DB or HTTP server

### Unit Tests — Repositories
- Each repository is tested with a **mocked `pg.Pool`**
- Verifies the exact SQL query string and parameters passed to the DB
- Verifies the mapped return value (DB snake_case → camelCase interface)

### Integration Tests — Auth
- Spins up a real **Express app** with routes wired up
- Uses **Supertest** to make actual HTTP requests
- Mocks `bcrypt` and `jsonwebtoken` to avoid real crypto
- Mocks the DB pool (`pg.Pool`) to control query responses
- Tests the full request→controller→service→repository→response chain
