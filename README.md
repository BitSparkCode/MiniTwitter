# 🐣 MiniTwitter

A full-stack mini social platform built with Node.js, TypeScript, PostgreSQL, and a vanilla TypeScript SPA frontend.

> Created by **Moritz Maier** · [GitHub Repo](https://github.com/BitSparkCode/MiniTwitter)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, TypeScript, Zod, JWT, bcrypt |
| Frontend | Vite, Vanilla TypeScript, hash-based SPA routing |
| Database | PostgreSQL 16 |
| Infrastructure | Docker, Docker Compose, nginx |

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/BitSparkCode/MiniTwitter.git
cd MiniTwitter
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` if needed:

```env
DB_USER=minitwitter
DB_PASSWORD=minitwitter_secret
DB_NAME=minitwitter_db
JWT_SECRET=change_me_to_a_long_random_secret
```

> **Important:** Change `JWT_SECRET` to a long random string before deploying.

### 3. Build and start

```bash
docker compose up --build
```

This starts:
- PostgreSQL 16 — schema and seed data applied automatically on first run
- Backend API on port **3000**
- Frontend (nginx) on port **8080**

### 4. Open the app

[http://localhost:8080](http://localhost:8080)

---

## Default Accounts

The database is seeded on first startup with demo accounts and sample posts, comments, and reactions.

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | admin |
| `moderator` | `moderator123` | moderator |
| `alice` | `user123` | user |
| `bob` | `user123` | user |
| `charlie` | `user123` | user |

Demo accounts are also shown on the login page with a one-click **Login** button.

> **Fresh start / re-seed:**
> ```bash
> docker compose down -v && docker compose up --build
> ```

---

## Stopping

```bash
docker compose down          # stop containers, keep data
docker compose down -v       # stop containers and delete database volume
```

---

## Features

### Posts
- Create, edit, and delete posts (280 character limit)
- Like / dislike reactions
- Comment count shown on each post, updates live

### Comments
- Add, edit, and delete comments on posts
- Moderators and admins can delete any comment
- Comment authors shown by `@username`

### Profiles
- View your own or any user's profile
- See all posts and comments by that user
- Update your own username

### Feed
- Shows all posts from all users with real `@usernames`
- Context banner indicates what is currently displayed

### Roles & Admin
- Three roles: `user`, `moderator`, `admin`
- Admins can lock/unlock accounts and change user roles

### Auth
- JWT-based authentication stored in `localStorage`
- Protected routes redirect to login when unauthenticated

---

## Project Structure

```
MiniTwitter/
├── backend/
│   ├── src/
│   │   ├── config/        # Database connection
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth & role middleware
│   │   ├── models/        # Data models
│   │   ├── repositories/  # DB queries (with comment counts)
│   │   ├── routes/        # Express routes
│   │   ├── services/      # Business logic
│   │   └── index.ts       # Entry point
│   ├── init.sql           # Database schema (auto-applied)
│   ├── seed.sql           # Seed data — default users, posts, comments
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/           # Typed API client
│   │   ├── components/    # Navbar, post card, comment list
│   │   ├── pages/         # Feed, profile, login, register
│   │   └── main.ts        # Router & session management
│   ├── index.html         # Global styles & app shell
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```
