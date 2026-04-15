# 🐣 MiniTwitter

A full-stack mini social platform built with Node.js, TypeScript, PostgreSQL, and a vanilla TypeScript SPA frontend.

## Tech Stack

- **Backend**: Node.js + Express + TypeScript + PostgreSQL + JWT
- **Frontend**: Vite + Vanilla TypeScript (SPA, hash-based routing)
- **Database**: PostgreSQL 16
- **Infrastructure**: Docker + Docker Compose

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/MiniTwitter.git
cd MiniTwitter
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and update the values if needed:

```env
DB_USER=minitwitter
DB_PASSWORD=minitwitter_secret
DB_NAME=minitwitter_db
JWT_SECRET=change_me_to_a_long_random_secret
```

> **Important**: Set `JWT_SECRET` to a long, random string in production.

### 3. Build and start the application

```bash
docker compose up --build
```

This will:
- Start a PostgreSQL 16 database and run the schema automatically
- Build and start the backend API on port **3000**
- Build and start the frontend (nginx) on port **8080**

### 4. Open the app

Visit [http://localhost:8080](http://localhost:8080) in your browser.

---

## Stopping the application

```bash
docker compose down
```

To also remove the database volume (all data):

```bash
docker compose down -v
```

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
│   │   ├── repositories/  # DB queries
│   │   ├── routes/        # Express routes
│   │   ├── services/      # Business logic
│   │   └── index.ts       # Entry point
│   ├── init.sql           # Database schema (auto-applied)
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # Navbar, post card, comment list
│   │   ├── pages/         # Feed, profile, login, register
│   │   └── main.ts        # Router & session management
│   ├── index.html
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Features

- Register and log in with JWT authentication
- Create, edit, and delete posts (280 character limit)
- Comment on posts, edit and delete your own comments
- Like / dislike reactions on posts
- User profiles with post and comment activity
- Role system: `user`, `moderator`, `admin`
- Admin controls: lock accounts, change user roles
