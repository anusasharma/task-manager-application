# TaskFlow — Multi-User Task Manager

A full-stack MVC web application for managing tasks across multiple users.
Built with Angular 17, Node.js/Express, PostgreSQL, and Docker.

---

## Solution Overview

TaskFlow is a multi-user task management application with a Kanban-style board.
Each user can register, log in, and manage their own tasks independently.
Tasks can be moved through three stages: **To Do → In Progress → Done**.

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17 (Standalone Components) |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 15 |
| Authentication | JWT + bcrypt |
| Containerization | Docker + docker-compose |
| Reverse Proxy | Nginx |
| CI/CD | GitHub Actions |

---

## MVC Architecture

| Layer | Location | Description |
|---|---|---|
| **Model** | `backend/src/models/` | Data schemas and PostgreSQL queries |
| **View** | `frontend/src/app/components/` | Angular UI components |
| **Controller** | `backend/src/controllers/` | Business logic and request handling |

---

## Project Structure
taskmanager/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and logger config
│   │   ├── models/         # User and Task models (DB access)
│   │   ├── controllers/    # Auth and Task business logic
│   │   ├── routes/         # API route definitions
│   │   ├── middleware/     # JWT authentication middleware
│   │   └── __tests__/      # Unit tests
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   │   ├── components/     # Login, Register, Dashboard views
│   │   ├── services/       # Auth and Task API services
│   │   ├── models/         # TypeScript interfaces
│   │   └── guards/         # Route protection
│   └── Dockerfile
├── nginx/
│   └── nginx.conf          # Reverse proxy config
├── .github/workflows/
│   └── ci.yml              # CI/CD pipeline
└── docker-compose.yml

---

## Prerequisites

- Docker Desktop
- Git

---

## Setup and Run

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd taskmanager
```

### 2. Start all services
```bash
docker compose up --build
```

### 3. Open the app
http://localhost

> First time setup takes 5-10 minutes while Docker pulls and builds images.

---

## How to Run Tests

### Backend Unit Tests
```bash
cd backend
npm install
npm test
```

### Manual Testing
1. Open **http://localhost**
2. Click **Register** and create an account
3. Create tasks using **+ New Task**
4. Move tasks between columns using the action buttons
5. Register a second account to verify multi-user isolation

### API Testing via curl
```bash
# Health check
curl http://localhost/health

# Register a new user
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"123456"}'

# Login
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive JWT token |
| GET | `/api/auth/me` | Yes | Get current logged in user |
| GET | `/api/tasks` | Yes | Get all tasks for current user |
| POST | `/api/tasks` | Yes | Create a new task |
| PUT | `/api/tasks/:id` | Yes | Update an existing task |
| DELETE | `/api/tasks/:id` | Yes | Delete a task |
| GET | `/health` | No | Health check |

---

## Logging

- **Backend** — Console logging for all API requests, errors, and database operations
- **Frontend** — Console logging for task operations (load, save, move, delete)
- **Nginx** — Access and error logs via Docker json-file driver

### View logs
```bash
# All services
docker compose logs

# Specific service
docker compose logs backend
docker compose logs frontend
docker compose logs nginx
```

---

## Assumptions and Decisions

1. **Angular Standalone Components** — Used Angular 17's modern standalone API.
   No NgModule needed, resulting in a cleaner and simpler structure.

2. **JWT stored in localStorage** — Simple and suitable for this scope.
   A production app would use HttpOnly cookies for better security.

3. **PostgreSQL over SQLite** — Better reflects a real production environment
   and supports concurrent multi-user access reliably.

4. **Nginx as reverse proxy** — Single entry point on port 80.
   Routes `/api/*` to the Node.js backend and `/` to the Angular frontend.

5. **Auto schema initialization** — Backend runs `CREATE TABLE IF NOT EXISTS`
   on startup. No migration tool needed for this scope.

6. **Multi-user data isolation** — All task queries filter by `user_id`.
   Users can only see and manage their own tasks.

7. **Non-persistent container design** — Containers are stateless.
   Only PostgreSQL uses a named volume for data persistence.

---

## CI/CD Pipeline

GitHub Actions pipeline runs automatically on every push to `main`:

| Job | Steps |
|---|---|
| **Backend** | Install → Lint → Unit Tests → TypeScript Build → Docker Build |
| **Frontend** | Install → Angular Build → Docker Build |

To run the pipeline locally using [act](https://github.com/nektos/act):
```bash
act push
```