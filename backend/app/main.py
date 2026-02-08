from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_db_and_tables
from app.api.routes import auth, tasks
from contextlib import asynccontextmanager
from app.core.config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing database...")
    create_db_and_tables()
    logger.info("Database initialized successfully!")
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="Todo App API",
    description="REST API for the Todo Application",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(auth.router, prefix="/v1", tags=["authentication"])
app.include_router(tasks.router, prefix="/v1", tags=["tasks"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Todo App API"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

# [Task: T-XXX] - Health check endpoint