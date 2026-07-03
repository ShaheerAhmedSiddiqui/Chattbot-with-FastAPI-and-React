from sqlalchemy.orm import Session
from app.database.database_model import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def get_user_by_email(db: Session, email:str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, name: str):
    return db.query(User).filter(User.name == name).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user_in: UserCreate):
    hashed_password = get_password_hash(user_in.password)

    db_user = User(
        email = user_in.email,
        name = user_in.name,
        password = hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user