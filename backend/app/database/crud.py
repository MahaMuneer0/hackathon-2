from sqlmodel import Session, select
from app.models.user import User, UserCreate, UserUpdate, UserRole
from app.models.task import Task, TaskCreate, TaskUpdate
from app.models.refresh_token import RefreshToken, RefreshTokenCreate
from app.core.security import get_password_hash
from typing import Optional
import uuid


# User CRUD Operations
def create_user(session: Session, user_create: UserCreate) -> User:
    """Create a new user"""
    hashed_password = get_password_hash(user_create.password)

    db_user = User(
        email=user_create.email,
        username=user_create.username,
        first_name=user_create.first_name,
        last_name=user_create.last_name,
        hashed_password=hashed_password,
        is_active=user_create.is_active if hasattr(user_create, 'is_active') else True,
        is_verified=user_create.is_verified if hasattr(user_create, 'is_verified') else False,
        role=user_create.role if hasattr(user_create, 'role') else UserRole.USER
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_id(session: Session, user_id: uuid.UUID) -> Optional[User]:
    """Get a user by ID"""
    return session.get(User, user_id)


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """Get a user by email"""
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def get_user_by_username(session: Session, username: str) -> Optional[User]:
    """Get a user by username"""
    statement = select(User).where(User.username == username)
    return session.exec(statement).first()


def update_user(session: Session, user_id: uuid.UUID, user_update: UserUpdate) -> Optional[User]:
    """Update a user"""
    db_user = session.get(User, user_id)
    if not db_user:
        return None

    user_data = user_update.dict(exclude_unset=True)
    if "password" in user_data:
        user_data["hashed_password"] = get_password_hash(user_data.pop("password"))

    for key, value in user_data.items():
        setattr(db_user, key, value)

    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def delete_user(session: Session, user_id: uuid.UUID) -> bool:
    """Delete a user"""
    db_user = session.get(User, user_id)
    if not db_user:
        return False

    session.delete(db_user)
    session.commit()
    return True


# Task CRUD Operations
def create_task(session: Session, task_create: TaskCreate, user_id: uuid.UUID) -> Task:
    """Create a new task for a user"""
    db_task = Task(
        title=task_create.title,
        description=task_create.description,
        status=task_create.status,
        priority=task_create.priority,
        due_date=task_create.due_date,
        completed_at=task_create.completed_at,
        user_id=user_id
    )

    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


def get_task_by_id(session: Session, task_id: uuid.UUID) -> Optional[Task]:
    """Get a task by ID"""
    return session.get(Task, task_id)


def get_tasks_by_user(
    session: Session,
    user_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    priority: Optional[str] = None
) -> list[Task]:
    """Get tasks for a specific user with optional filters"""
    statement = select(Task).where(Task.user_id == user_id)

    if status:
        statement = statement.where(Task.status == status)
    if priority:
        statement = statement.where(Task.priority == priority)

    statement = statement.offset(skip).limit(limit)
    return session.exec(statement).all()


def update_task(session: Session, task_id: uuid.UUID, task_update: TaskUpdate) -> Optional[Task]:
    """Update a task"""
    db_task = session.get(Task, task_id)
    if not db_task:
        return None

    task_data = task_update.dict(exclude_unset=True)
    for key, value in task_data.items():
        setattr(db_task, key, value)

    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


def delete_task(session: Session, task_id: uuid.UUID) -> bool:
    """Delete a task"""
    db_task = session.get(Task, task_id)
    if not db_task:
        return False

    session.delete(db_task)
    session.commit()
    return True


# Refresh Token CRUD Operations
def create_refresh_token(session: Session, token_create: RefreshTokenCreate) -> RefreshToken:
    """Create a new refresh token"""
    db_token = RefreshToken(
        token=token_create.token,
        user_id=token_create.user_id,
        expires_at=token_create.expires_at,
        is_revoked=token_create.is_revoked
    )

    session.add(db_token)
    session.commit()
    session.refresh(db_token)
    return db_token


def get_refresh_token(session: Session, token: str) -> Optional[RefreshToken]:
    """Get a refresh token by its value"""
    statement = select(RefreshToken).where(RefreshToken.token == token)
    return session.exec(statement).first()


def revoke_refresh_token(session: Session, token: str) -> bool:
    """Revoke a refresh token"""
    db_token = get_refresh_token(session, token)
    if not db_token:
        return False

    db_token.is_revoked = True
    session.add(db_token)
    session.commit()
    return True


def cleanup_expired_tokens(session: Session) -> int:
    """Remove expired refresh tokens"""
    from datetime import datetime
    statement = (
        select(RefreshToken)
        .where(RefreshToken.expires_at < datetime.utcnow())
        .where(RefreshToken.is_revoked == False)
    )
    expired_tokens = session.exec(statement).all()

    for token in expired_tokens:
        session.delete(token)

    session.commit()
    return len(expired_tokens)