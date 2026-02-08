# Todo App Phase 2 - Multi-Agent Build

## Project Context
This is Phase 2 of the hackathon: transforming console app to full-stack web application.

## Multi-Agent Architecture
This project uses 4 specialized agents:

1. **@architect-agent.skill** - System design and specifications
2. **@database-agent.skill** - Database setup and models
3. **@backend-agent.skill** - FastAPI API implementation
4. **@frontend-agent.skill** - Next.js UI implementation

## Workflow

Before ANY code is written:
1. Architect Agent creates all specifications
2. Database Agent implements database layer
3. Backend Agent implements API endpoints
4. Frontend Agent implements UI

## Project Structure
hackathon-todo-phase2/
├── specs/           # All specifications (ARCHITECT creates these)
├── backend/         # FastAPI app (DATABASE + BACKEND build this)
└── frontend/        # Next.js app (FRONTEND builds this)

## Development Process

### Phase 1: Architecture (Use @architect-agent.skill)
- Create specs/overview.md
- Create specs/database/schema.md
- Create specs/api/rest-endpoints.md
- Create specs/ui/components.md

### Phase 2: Database (Use @database-agent.skill)
- Setup Neon PostgreSQL
- Create SQLModel models
- Initialize database tables

### Phase 3: Backend (Use @backend-agent.skill)
- Implement auth endpoints
- Implement task CRUD endpoints
- Setup JWT middleware

### Phase 4: Frontend (Use @frontend-agent.skill)
- Create Next.js app
- Implement auth pages (signup/login)
- Implement dashboard
- Connect to API

## Commands

Start backend:
````bash
cd backend && uvicorn app.main:app --reload
````

Start frontend:
````bash
cd frontend && npm run dev
````

## Critical Rules
- No code without specs
- Follow skill workflows exactly
- Test each agent's output before moving to next