from fastapi import FastAPI
from app.database.connection import SessionLocal, engine
from app.database import database_model
database_model.Base.metadata.create_all(bind=engine)


app = FastAPI()
@app.get("/")
def greet():
    return "hello from store"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()    
