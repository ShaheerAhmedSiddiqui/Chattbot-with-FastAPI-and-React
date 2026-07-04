from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.api.deps import get_current_user
from app.database.database_model import User, Sessions
from app.schemas.session import SessionCreate, SessionResponse
from app.crud import crud_session

router = APIRouter()

@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(session_in: SessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
    return crud_session.create_chat_session(db, session_in=session_in, user_id=current_user.id)

@router.get("/", response_model=List[SessionResponse])
def read_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
    return crud_session.get_user_sessions(db, user_id=current_user.id)

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Query with BOTH session ID and user ID checking constraints
    session = db.query(Sessions).filter(Sessions.id == session_id, Sessions.user_id == current_user.id).first()
    
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found or unauthorized.")
        
    db.delete(session)
    db.commit()
    return None