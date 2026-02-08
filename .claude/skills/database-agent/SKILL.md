---
name: database-agent
description: Database specialist for Neon PostgreSQL setup, SQLModel models, and migrations. Use when creating database tables, defining models, setting up database connections, or managing schema migrations with Alembic for FastAPI applications.
---
# Database Agent Skill

## Role
Database specialist responsible for:
- Setting up Neon PostgreSQL
- Creating SQLModel models
- Database migrations
- Connection management

## Prerequisites
- Neon account created
- DATABASE_URL from Neon dashboard

## Workflow

### Step 1: Setup Neon Database

1. Go to https://neon.tech
2. Create new project: "hackathon-todo"
3. Copy connection string

### Step 2: Create Backend Structure
````bash
cd backend
mkdir -p app/models app/db

# Create pyproject.toml
cat > pyproject.toml << 'EOF'
[project]
name = "todo-backend"
version = "0.1.0"
requires-python = ">=3.13"
dependencies = [
    "fastapi",
    "sqlmodel",
    "uvicorn[standard]",
    "python-jose[cryptography]",
    "passlib[bcrypt]",
    "python-multipart",
    "asyncpg",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
EOF

# Install dependencies
uv sync
````

### Step 3: Create Database Models

Create `app/models/user.py`:
````python
from sqlmodel import Field, SQLModel
from datetime import datetime
from uuid import UUID, uuid4

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    name: str | None = Field(default=None, max_length=100)
    created_at: datetime = Field(default_factory=datetime.utcnow)
````

Create `app/models/task.py`:
````python
from sqlmodel import Field, SQLModel
from datetime import datetime
from uuid import UUID

class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    
    id: int | None = Field(default=None, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: str | None = Field(default=None)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
````

Create `app/models/__init__.py`:
````python
from .user import User
from .task import Task

__all__ = ["User", "Task"]
````

### Step 4: Database Connection

Create `app/db/connection.py`:
````python
from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager
import os

# Get DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Convert to async format for asyncpg
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    future=True
)

# Create session maker
async_session = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

@asynccontextmanager
async def get_session():
    """Get database session"""
    async with async_session() as session:
        yield session

async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
````

### Step 5: Environment Variables

Create `backend/.env`:
````env
DATABASE_URL=postgresql://your-neon-url-here
JWT_SECRET=your-super-secret-key-here-change-this
````

**Important:** Get DATABASE_URL from Neon dashboard!

### Step 6: Create Database Initialization Script

Create `app/db/init_db.py`:
````python
import asyncio
from app.db.connection import init_db

async def main():
    """Initialize database"""
    print("Creating database tables...")
    await init_db()
    print("✅ Database initialized successfully!")

if __name__ == "__main__":
    asyncio.run(main())
````

Run it:
````bash
cd backend
python -m app.db.init_db
````

## Verification

Check database tables were created:
1. Go to Neon dashboard
2. Open SQL Editor
3. Run: `SELECT * FROM information_schema.tables WHERE table_schema='public';`
4. Should see `users` and `tasks` tables

## Output Deliverables

- ✅ `app/models/user.py` - User model
- ✅ `app/models/task.py` - Task model
- ✅ `app/db/connection.py` - Database connection
- ✅ Database tables created in Neon