# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlmodel import Session
# from app.database import get_session
# from app.models.user import User, UserCreate
# from app.models.refresh_token import RefreshToken, RefreshTokenCreate
# from app.database.crud import create_user, get_user_by_email, get_user_by_username, create_refresh_token as db_create_refresh_token
# from app.core.auth import authenticate_user, create_access_token, get_current_user
# from app.core.config import settings
# from app.schemas import UserCreate as UserCreateSchema, UserLogin, TokenResponse, RefreshTokenRequest, RefreshTokenResponse, UserResponse
# from datetime import timedelta, datetime
# import uuid
# import secrets

# router = APIRouter(prefix="/auth", tags=["authentication"])

# @router.post("/signup", response_model=TokenResponse)
# async def signup(user_data: UserCreateSchema, session: Session = Depends(get_session)):
#     # Check if user with email already exists
#     existing_user_by_email = get_user_by_email(session, user_data.email)
#     if existing_user_by_email:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Email already registered"
#         )

#     # Check if user with username already exists
#     existing_user_by_username = get_user_by_username(session, user_data.username)
#     if existing_user_by_username:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Username already taken"
#         )

#     # Create the user
#     db_user = create_user(session, UserCreate(**user_data.model_dump()))

#     # Create access and refresh tokens
#     access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
#     refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

#     access_token = create_access_token(
#         data={"sub": str(db_user.id)}, expires_delta=access_token_expires
#     )
#     refresh_token_value = secrets.token_urlsafe(32)
#     refresh_token = db_create_refresh_token(
#         session,
#         RefreshTokenCreate(
#             token=refresh_token_value,
#             user_id=db_user.id,
#             expires_at=datetime.utcnow() + refresh_token_expires,
#             is_revoked=False
#         )
#     )

#     return TokenResponse(
#         access_token=access_token,
#         refresh_token=refresh_token_value,
#         user=UserResponse.model_validate(db_user)
#     )


# @router.post("/login", response_model=TokenResponse)
# async def login(credentials: UserLogin, session: Session = Depends(get_session)):
#     user = authenticate_user(session, credentials.email_or_username, credentials.password)

#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect email/username or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )

#     # Create access and refresh tokens
#     access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
#     refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

#     access_token = create_access_token(
#         data={"sub": str(user.id)}, expires_delta=access_token_expires
#     )
#     refresh_token_value = secrets.token_urlsafe(32)
#     refresh_token = db_create_refresh_token(
#         session,
#         RefreshTokenCreate(
#             token=refresh_token_value,
#             user_id=user.id,
#             expires_at=datetime.utcnow() + refresh_token_expires,
#             is_revoked=False
#         )
#     )

#     return TokenResponse(
#         access_token=access_token,
#         refresh_token=refresh_token_value,
#         user=UserResponse.model_validate(user)
#     )


# @router.post("/logout")
# async def logout():
#     # In a real implementation, you would invalidate the refresh token
#     # For now, just return a success message
#     return {"message": "Logged out successfully"}


# @router.get("/me", response_model=UserResponse)
# async def get_current_user_profile(current_user: User = Depends(get_current_user)):
#     return UserResponse.model_validate(current_user)


# @router.post("/refresh", response_model=RefreshTokenResponse)
# async def refresh_access_token(request: RefreshTokenRequest, session: Session = Depends(get_session)):
#     # Find the refresh token in the database
#     from sqlmodel import select
#     refresh_token_db = session.exec(
#         select(RefreshToken).where(RefreshToken.token == request.refresh_token)
#     ).first()

#     if not refresh_token_db:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid refresh token"
#         )

#     if refresh_token_db.is_revoked:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Refresh token revoked"
#         )

#     if refresh_token_db.expires_at < datetime.utcnow():
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Refresh token expired"
#         )

#     # Get the user associated with this refresh token
#     user = session.get(User, refresh_token_db.user_id)
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="User not found"
#         )

#     # Create a new access token
#     access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
#     access_token = create_access_token(
#         data={"sub": str(user.id)}, expires_delta=access_token_expires
#     )

#     return RefreshTokenResponse(access_token=access_token)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import timedelta, datetime
import secrets

from app.database import get_session
from app.models.user import User
from app.models.refresh_token import RefreshToken, RefreshTokenCreate
from app.database.crud import (
    create_user,
    get_user_by_email,
    get_user_by_username,
    create_refresh_token,
)
from app.core.auth import authenticate_user, create_access_token, get_current_user
from app.core.config import settings
from app.schemas import (
    UserCreate,
    UserLogin,
    TokenResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["authentication"])
@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate, session: Session = Depends(get_session)):
    if get_user_by_email(session, user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    if get_user_by_username(session, user_data.username):
        raise HTTPException(status_code=400, detail="Username already taken")

    db_user = create_user(session, user_data)

    access_token = create_access_token(
        data={"sub": str(db_user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    refresh_token_value = secrets.token_urlsafe(32)
    create_refresh_token(
        session,
        RefreshTokenCreate(
            token=refresh_token_value,
            user_id=db_user.id,
            expires_at=datetime.utcnow()
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            is_revoked=False,
        ),
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_value,
        user=UserResponse.model_validate(db_user),
    )
@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, session: Session = Depends(get_session)):
    user = authenticate_user(
        session, credentials.email_or_username, credentials.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
        )

    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    refresh_token_value = secrets.token_urlsafe(32)
    create_refresh_token(
        session,
        RefreshTokenCreate(
            token=refresh_token_value,
            user_id=user.id,
            expires_at=datetime.utcnow()
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            is_revoked=False,
        ),
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_value,
        user=UserResponse.model_validate(user),
    )
@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_access_token(
    request: RefreshTokenRequest, session: Session = Depends(get_session)
):
    token_db = session.exec(
        select(RefreshToken).where(RefreshToken.token == request.refresh_token)
    ).first()

    if (
        not token_db
        or token_db.is_revoked
        or token_db.expires_at < datetime.utcnow()
    ):
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = session.get(User, token_db.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # OPTIONAL: rotate token
    token_db.is_revoked = True
    session.add(token_db)
    session.commit()

    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return RefreshTokenResponse(access_token=access_token)
@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
