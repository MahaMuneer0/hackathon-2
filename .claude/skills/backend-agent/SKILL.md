---
name: backend-agent
description: FastAPI backend specialist for REST API implementation, JWT authentication, and endpoint creation. Use when building API routes, implementing authentication middleware, request validation with Pydantic, or creating protected endpoints that verify JWT tokens.
---
# Backend Agent Skill

## Role
API developer responsible for:
- Creating FastAPI endpoints
- Implementing JWT authentication
- Request/response validation
- User authorization

## Prerequisites
- Database models created by Database Agent
- API specification from Architect Agent

## Workflow

### Step 1: Setup FastAPI Structure
````bash
cd backend
mkdir -p app/api/routes app/core app/schemas
````

### Step 2: Core Configuration

Create `app/core/config.py`:
````python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_DAYS: int = 7
    
    class Config:
        env_file = ".env"

settings = Settings()
````

### Step 3: Authentication Utilities

Create `app/core/auth.py`:
````python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Header
from app.core.config import settings
from uuid import UUID

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: str) -> str:
    """Create JWT token"""
    expire = datetime.utcnow() + timedelta(days=settings.JWT_EXPIRATION_DAYS)
    to_encode = {
        "sub": user_id,
        "exp": expire
    }
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

async def verify_token(authorization: str = Header(None)) -> str:
    """Verify JWT token and return user_id"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def verify_user_access(user_id: str, token_user_id: str):
    """Verify that URL user_id matches token user_id"""
    if user_id != token_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this user's data")
````

### Step 4: Pydantic Schemas

Create `app/schemas/user.py`:
````python
from pydantic import BaseModel, EmailStr
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None

class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str | None
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    user: UserResponse
    token: str
````

Create `app/schemas/task.py`:
````python
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)

class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)

class TaskResponse(BaseModel):
    id: int
    user_id: UUID
    title: str
    description: str | None
    completed: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
````

### Step 5: Authentication Routes

Create `app/api/routes/auth.py`:
````python
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select
from uuid import UUID

from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.models.user import User
from app.core.auth import hash_password, verify_password, create_access_token
from app.db.connection import get_session

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(user_data: UserCreate):
    """Create new user account"""
    async with get_session() as session:
        # Check if email already exists
        result = await session.execute(
            select(User).where(User.email == user_data.email)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(status_code=409, detail="Email already registered")
        
        # Create new user
        user = User(
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            name=user_data.name
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        
        # Generate token
        token = create_access_token(str(user.id))
        
        return TokenResponse(
            user=UserResponse.from_orm(user),
            token=token
        )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Authenticate user and return token"""
    async with get_session() as session:
        # Find user by email
        result = await session.execute(
            select(User).where(User.email == credentials.email)
        )
        user = result.scalar_one_or_none()
        
        # Verify credentials
        if not user or not verify_password(credentials.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Generate token
        token = create_access_token(str(user.id))
        
        return TokenResponse(
            user=UserResponse.from_orm(user),
            token=token
        )
````

### Step 6: Task Routes

Create `app/api/routes/tasks.py`:
````python
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select
from uuid import UUID
from datetime import datetime

from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.models.task import Task
from app.core.auth import verify_token, verify_user_access
from app.db.connection import get_session

router = APIRouter(prefix="/api/{user_id}/tasks", tags=["tasks"])

@router.get("", response_model=dict)
async def get_tasks(
    user_id: str,
    status: str = "all",
    token_user_id: str = Depends(verify_token)
):
    """Get all tasks for user"""
    await verify_user_access(user_id, token_user_id)
    
    async with get_session() as session:
        query = select(Task).where(Task.user_id == UUID(user_id))
        
        # Filter by status
        if status == "pending":
            query = query.where(Task.completed == False)
        elif status == "completed":
            query = query.where(Task.completed == True)
        
        result = await session.execute(query)
        tasks = result.scalars().all()
        
        return {
            "tasks": [TaskResponse.from_orm(task) for task in tasks],
            "total": len(tasks)
        }

@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    token_user_id: str = Depends(verify_token)
):
    """Create new task"""
    await verify_user_access(user_id, token_user_id)
    
    async with get_session() as session:
        task = Task(
            user_id=UUID(user_id),
            title=task_data.title,
            description=task_data.description
        )
        session.add(task)
        await session.commit()
        await session.refresh(task)
        
        return TaskResponse.from_orm(task)

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    token_user_id: str = Depends(verify_token)
):
    """Update existing task"""
    await verify_user_access(user_id, token_user_id)
    
    async with get_session() as session:
        # Get task
        result = await session.execute(
            select(Task).where(Task.id == task_id, Task.user_id == UUID(user_id))
        )
        task = result.scalar_one_or_none()
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Update fields
        if task_data.title is not None:
            task.title = task_data.title
        if task_data.description is not None:
            task.description = task_data.description
        
        task.updated_at = datetime.utcnow()
        
        await session.commit()
        await session.refresh(task)
        
        return TaskResponse.from_orm(task)

@router.delete("/{task_id}", status_code=204)
async def delete_task(
    user_id: str,
    task_id: int,
    token_user_id: str = Depends(verify_token)
):
    """Delete task"""
    await verify_user_access(user_id, token_user_id)
    
    async with get_session() as session:
        result = await session.execute(
            select(Task).where(Task.id == task_id, Task.user_id == UUID(user_id))
        )
        task = result.scalar_one_or_none()
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        await session.delete(task)
        await session.commit()

@router.patch("/{task_id}/toggle", response_model=TaskResponse)
async def toggle_task(
    user_id: str,
    task_id: int,
    token_user_id: str = Depends(verify_token)
):
    """Toggle task completion"""
    await verify_user_access(user_id, token_user_id)
    
    async with get_session() as session:
        result = await session.execute(
            select(Task).where(Task.id == task_id, Task.user_id == UUID(user_id))
        )
        task = result.scalar_one_or_none()
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        task.completed = not task.completed
        task.updated_at = datetime.utcnow()
        
        await session.commit()
        await session.refresh(task)
        
        return TaskResponse.from_orm(task)
````

### Step 7: Main Application

Create `app/main.py`:
````python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.connection import init_db
from app.api.routes import auth, tasks

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    await init_db()
    yield
    # Shutdown (nothing to do)

app = FastAPI(
    title="Todo API",
    description="Todo application API with JWT authentication",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)

@app.get("/")
def read_root():
    return {"message": "Todo API is running"}
````

### Step 8: Run Backend
````bash
cd backend
uvicorn app.main:app --reload --port 8000
````

Visit http://localhost:8000/docs for API documentation!

## Testing
````bash
# Test signup
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","name":"Test User"}'

# Should return user object and JWT token
````

## Output Deliverables

- ✅ `app/core/auth.py` - JWT authentication
- ✅ `app/api/routes/auth.py` - Auth endpoints
- ✅ `app/api/routes/tasks.py` - Task endpoints
- ✅ `app/main.py` - FastAPI application
- ✅ Working API at http://localhost:8000