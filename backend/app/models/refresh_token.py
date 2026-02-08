from sqlmodel import SQLModel, Field
from typing import Optional
import uuid
from datetime import datetime


class RefreshTokenBase(SQLModel):
    token: str = Field(unique=True, nullable=False, max_length=255)
    user_id: uuid.UUID = Field(nullable=False)
    expires_at: datetime = Field(nullable=False)
    is_revoked: bool = Field(default=False)


class RefreshToken(RefreshTokenBase, table=True):
    __tablename__ = "refresh_tokens"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default=datetime.utcnow())


class RefreshTokenCreate(RefreshTokenBase):
    pass


class RefreshTokenPublic(RefreshTokenBase):
    id: uuid.UUID
    created_at: datetime