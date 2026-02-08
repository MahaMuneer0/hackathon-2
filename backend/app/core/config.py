from pydantic_settings import BaseSettings
from typing import Optional, List
import os


class Settings(BaseSettings):
    # Database settings
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")

    # JWT settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "JxC_A-WSjxjci9yXEdN")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # CORS settings
    origins: List[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:8000",
        "https://localhost",
        "https://localhost:3000",
        "https://localhost:8000",
    ]

    model_config = {"env_file": ".env"}


settings = Settings()