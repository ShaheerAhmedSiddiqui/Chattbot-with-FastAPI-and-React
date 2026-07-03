from pydantic import BaseModel
from datetime import datetime

class MessageCreate(BaseModel):
    session_id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    session_id: int
    sender: str  # "user" or "bot"
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True