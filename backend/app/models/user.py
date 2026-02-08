from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
import uuid
from datetime import datetime
from enum import Enum

if TYPE_CHECKING:
    from .task import Task


class UserRole(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class UserBase(SQLModel):
    email: str = Field(unique=True, nullable=False, max_length=255)
    username: str = Field(unique=True, nullable=False, max_length=50)
    first_name: Optional[str] = Field(default=None, max_length=50)
    last_name: Optional[str] = Field(default=None, max_length=50)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)


class User(UserBase, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str = Field(nullable=False, max_length=255)
    role: UserRole = Field(default=UserRole.USER)
    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default=datetime.utcnow(), sa_column_kwargs={"onupdate": datetime.utcnow()})

    # Relationship
    tasks: list["Task"] = Relationship(back_populates="user")


class UserCreate(UserBase):
    password: str


class UserUpdate(SQLModel):
    email: Optional[str] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None


class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    is_active: bool
    is_verified: bool