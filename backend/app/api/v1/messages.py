from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.api.deps import get_current_user
from app.database.database_model import User, Sessions
from app.schemas.message import MessageCreate, MessageResponse
from app.crud import crud_message
from app.services.ai_services import ai_service

router = APIRouter()

@router.post("/", response_model=MessageResponse)
async def send_message(message_in: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
    session = db.query(Sessions).filter(Sessions.id == message_in.session_id, Sessions.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat context session thread not found.")

    db_history = crud_message.get_session_messages(db, session_id=message_in.session_id)
    history_payload = [{"sender": m.sender, "content": m.content} for m in db_history]

    crud_message.save_message(db, session_id=message_in.session_id, sender="user", content=message_in.content)

    bot_reply = await ai_service.generate_chat_response(prompt=message_in.content, history=history_payload)

    saved_bot_message = crud_message.save_message(db, session_id=message_in.session_id, sender="bot", content=bot_reply)

    return saved_bot_message


@router.get("/{session_id}", response_model=List[MessageResponse])
def read_message_history(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(Sessions).filter(Sessions.id == session_id, Sessions.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat container context thread not found.")
        
    return crud_message.get_session_messages(db, session_id=session_id)