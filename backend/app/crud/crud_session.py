from sqlalchemy.orm import Session
from app.database.database_model import Sessions
from app.schemas.session import SessionCreate

def get_user_sessions(db: Session, user_id: int):
   
    return db.query(Sessions).filter(Sessions.user_id == user_id).order_by(Sessions.created_at.desc()).all()

def create_chat_session(db: Session, session_in: SessionCreate, user_id: int):
   
    db_session = Sessions(
        title=session_in.title,
        user_id=user_id
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def delete_chat_session(db: Session, session_id: int, user_id: int) -> bool:
    
    db_session = db.query(Sessions).filter(Sessions.id == session_id, Sessions.user_id == user_id).first()
    if db_session:
        db.delete(db_session)   
        db.commit()
        return True
    return False