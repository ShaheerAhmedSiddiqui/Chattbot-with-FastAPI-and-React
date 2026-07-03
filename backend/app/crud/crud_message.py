from sqlalchemy.orm import Session
from app.database.database_model import Messages

def get_session_messages(db: Session, session_id: int):
  
    return db.query(Messages).filter(Messages.sessions_id == session_id).order_by(Messages.timestamp.asc()).all()

def save_message(db: Session, session_id: int, sender: str, content: str):
  
    db_message = Messages(
        sessions_id=session_id,
        sender=sender,
        content=content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message