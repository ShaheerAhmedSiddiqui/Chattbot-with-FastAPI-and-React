import enum 
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = "User"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
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

class Messages(Base):
    __tablename__ = "Messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("Sessions.id", ondelete="CASCADE"), nullable=False, index=True)  # renamed
    sender = Column(String, nullable=False)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    session = relationship("Sessions", back_populates="messages")