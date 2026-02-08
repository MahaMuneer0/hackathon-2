---
title: "Create Technical Plan for Web Todo App"
date: "2025-12-30"
stage: "plan"
id: "phr-20251230-web-todo-app-plan"
---

# Create Technical Plan for Web Todo App

## PROMPT_TEXT

Technical Plan – Phase II: Full-Stack Multi-User Todo Web Application

## Goal
Transform the Phase I in-memory console Todo app into a modern, multi-user web application with persistent storage and user authentication.

All Basic Level features must work over the web:
- Add task
- List all my tasks
- View task details
- Update task
- Delete task
- Toggle complete

Each user must see and manage only their own tasks. Tasks are stored permanently in Neon Serverless PostgreSQL.

## Guiding Principles (from Constitution & Hackathon Rules)
- Strictly Spec-Driven Development – no manual coding
- Monorepo structure with separate frontend and backend folders
- Reuse logic/concepts from Phase I where possible
- Clean, type-safe, readable code on both sides
- Authentication using Better Auth with JWT tokens
- Shared BETTER_AUTH_SECRET between frontend and backend
- All API calls must include JWT and filter tasks by authenticated user_id

## High-Level Architecture
User Browser
│
▼
Next.js Frontend (Vercel) ←─── HTTPS ───→ FastAPI Backend (local / later Docker)
│
▼
Neon PostgreSQL (Serverless)


- Frontend and backend are separate services
- Frontend handles UI, auth flow, and calls backend API with JWT
- Backend verifies JWT, extracts user_id, and filters all queries by user_id

## Tech Stack (Must Use Exactly)
- Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- Backend: FastAPI (Python), SQLModel, Uvicorn
- Database: Neon Serverless PostgreSQL
- ORM: SQLModel
- Authentication: Better Auth (configured for JWT tokens)
- Shared secret: BETTER_AUTH_SECRET environment variable

## Monorepo Structure
hackathon-todo/
├── .spec-kit/
│   └── config.yaml
├── specs/
│   ├── overview.md
│   ├── architecture.md
│   ├── features/
│   │   ├── task-crud.md
│   │   └── authentication.md
│   ├── api/
│   │   └── rest-endpoints.md
│   ├── database/
│   │   └── schema.md
│   └── ui/
│       └── components.md
├── frontend/                  # Next.js app
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── CLAUDE.md
├── backend/                   # FastAPI app
│   ├── main.py
│   ├── models.py
│   ├── routes/
│   ├── db.py
│   └── CLAUDE.md
├── phase1-src/                # Archived Phase I code (reference only)
├── CLAUDE.md                  # Root instructions
├── docker-compose.yml         # For local development
├── .env                       # Local secrets (not committed)
└── README.md
names can be chnage but the structure is same

## Component Breakdown

### 1. Database Layer (Neon + SQLModel)
- Table: tasks
  - id: Integer (primary key)
  - user_id: String (foreign key to Better Auth users table)
  - title: String (not null)
  - description: String (nullable)
  - completed: Boolean (default false)
  - created_at: DateTime
  - updated_at: DateTime
- Table: users → managed automatically by Better Auth

### 2. Backend (FastAPI)
- Connection via DATABASE_URL environment variable
- SQLModel models in backend/models.py
- Dependency to get DB session
- JWT verification middleware:
  - Extract token from Authorization: Bearer header
  - Verify with BETTER_AUTH_SECRET
  - Extract user_id from payload
  - Attach user_id to request state
- All task routes filter by request.state.user_id
- REST API Endpoints (base: /api):
  - GET    /tasks          → list my tasks
  - POST   /tasks          → create task
  - GET    /tasks/{id}     → get one task
  - PUT    /tasks/{id}     → update task
  - DELETE /tasks/{id}     → delete task
  - PATCH  /tasks/{id}/complete → toggle complete

### 3. Frontend (Next.js App Router)
- Pages/Layout:
  - app/page.tsx → Home / Login redirect
  - app/dashboard/page.tsx → Main task list
  - app/login/page.tsx & app/signup/page.tsx → Auth forms
- Components:
  - TaskList, TaskItem, TaskForm, Header (with logout)
- lib/api.ts → API client that:
  - Automatically attaches JWT from Better Auth session to every request
  - Points to backend URL (localhost:8000 in dev)
- Use server components where possible, client components for interactivity
- Tailwind for responsive, clean UI

### 4. Authentication Flow (Better Auth + JWT)
- Better Auth configured in frontend with JWT plugin enabled
- On login/signup → Better Auth issues JWT
- JWT stored in httpOnly cookie or memory
- Every API call → include Authorization: Bearer <token>
- Backend middleware verifies token and enforces user isolation

## Local Development Flow
- Backend: uvicorn backend.main:app --reload --port 8000
- Frontend: cd frontend && npm run dev
- Both read .env file for secrets

## Security Guarantees
- No task leakage between users
- Stateless auth (JWT) – scalable
- Secrets never hardcoded

## Future-Proofing (for Phase III–V)
- Keep task logic in backend only
- API endpoints match MCP tool names planned for Phase III
- Clear separation prepares for Docker/K8s

## RESPONSE_TEXT

Created a comprehensive technical plan at 'specs/1-web-todo-app/plan.md' that addresses all requirements for the Phase II Full-Stack Multi-User Todo Web Application. The plan includes:

1. Detailed architecture overview with monorepo structure
2. Database layer design with Neon PostgreSQL and SQLModel
3. Backend implementation with FastAPI and authentication middleware
4. Frontend implementation with Next.js 16+, TypeScript, and Tailwind CSS
5. Comprehensive implementation steps across four phases:
   - Phase 1: Backend setup with database, models, and API routes
   - Phase 2: Frontend setup with components and authentication
   - Phase 3: Integration and testing of all features
   - Phase 4: Final testing, security validation, and documentation
6. Environment configuration for both frontend and backend
7. Security measures including JWT verification and user isolation
8. Requirement mapping showing how each requirement is addressed
9. Future-proofing considerations for subsequent phases

The plan ensures all basic operations (Add, List, View, Update, Delete, Toggle Complete) are implemented with proper user isolation, responsive design, and the exact tech stack specified in the requirements.