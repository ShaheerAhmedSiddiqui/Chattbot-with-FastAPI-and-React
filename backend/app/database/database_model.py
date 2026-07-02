import enum 
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base


class User(Base):
    __tablename__ = "User" # Tip: You might want to rename the table to "products" later!
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True) # Use String here instead of Email
    password = Column(String)

    sessions = relationship("Sessions", back_populates="user", cascade="all, delete-orphan")


class Sessions(Base):
    __tablename__ = "Sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("User.id", ondelete="CASCADE"), nullable=False, index=True)    
    title = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="sessions")

    messages = relationship("Messages", back_populates="session", cascade="all, delete-orphan")

class SenderType(enum.Enum):
    USER = "user"
    BOT = "bot"

class Messages(Base):
    __tablename__ = "Messages"

    id = Column(Integer, primary_key=True, index=True)
    sessions_id = Column(Integer, ForeignKey("Sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(Enum(SenderType), nullable=False) 
    content = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("Sessions", back_populates="messages")