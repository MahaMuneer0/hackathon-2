from sqlmodel import Session
from fastapi import Depends
from app.database import get_session


def get_db_session():
    """Dependency to get database session"""
    with next(get_session()) as session:
        yield session


# Alias for backward compatibility
DBSessionDep = Depends(get_db_session)