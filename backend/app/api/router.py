from fastapi import APIRouter
from app.api.v1 import auth, sessions, messages


api_router = APIRouter()


api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["Chat Sessions"])
api_router.include_router(messages.router, prefix="/messages", tags=["Chat Messages"]) # Mount here