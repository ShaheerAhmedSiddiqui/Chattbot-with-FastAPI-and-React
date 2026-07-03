from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Schema for incoming data when registering a new user
class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters long")

# Schema for incoming data when logging in
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schema for data returned back to the client (excludes password for safety)
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str

    class Config:
        from_attributes = True  

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse