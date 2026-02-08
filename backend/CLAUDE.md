# Backend Development Guide

Use @database-agent.skill and @backend-agent.skill for all backend work.

## Structure
backend/
├── app/
│   ├── models/        # SQLModel models (DATABASE AGENT)
│   ├── db/            # Database connection (DATABASE AGENT)
│   ├── core/          # Auth utilities (BACKEND AGENT)
│   ├── schemas/       # Pydantic schemas (BACKEND AGENT)
│   ├── api/routes/    # API endpoints (BACKEND AGENT)
│   └── main.py        # FastAPI app (BACKEND AGENT)
├── .env
└── pyproject.toml
## Before Starting
- Check @specs/database/schema.md
- Check @specs/api/rest-endpoints.md
- Have DATABASE_URL from Neon ready

## Development Order
1. Database models (use database-agent skill)
2. Auth system (use backend-agent skill)
3. Task endpoints (use backend-agent skill)