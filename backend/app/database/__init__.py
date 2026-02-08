from sqlmodel import SQLModel
from sqlmodel import create_engine, Session
from sqlalchemy import event
from sqlalchemy.engine import Engine
import sqlite3
import os
from typing import Generator
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")

# Create engine
engine = create_engine(DATABASE_URL, echo=False)


def get_session() -> Generator[Session, None, None]:
    """Get database session"""
    with Session(engine) as session:
        yield session


def create_db_and_tables():
    """Create database tables"""
    from app.models.user import User
    from app.models.task import Task
    from app.models.refresh_token import RefreshToken

    logger.info("Creating database tables...")
    SQLModel.metadata.create_all(engine)
    logger.info("Database tables created successfully!")


# Enable foreign key support for SQLite
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


from .crud import (
    create_user,
    get_user_by_id,
    get_user_by_email,
    get_user_by_username,
    update_user,
    delete_user,
    create_task,
    get_task_by_id,
    get_tasks_by_user,
    update_task,
    delete_task,
    create_refresh_token,
    get_refresh_token,
    revoke_refresh_token,
    cleanup_expired_tokens
)

__all__ = [
    "create_user",
    "get_user_by_id",
    "get_user_by_email",
    "get_user_by_username",
    "update_user",
    "delete_user",
    "create_task",
    "get_task_by_id",
    "get_tasks_by_user",
    "update_task",
    "delete_task",
    "create_refresh_token",
    "get_refresh_token",
    "revoke_refresh_token",
    "cleanup_expired_tokens",
    "get_session",
    "create_db_and_tables",
    "engine"
]