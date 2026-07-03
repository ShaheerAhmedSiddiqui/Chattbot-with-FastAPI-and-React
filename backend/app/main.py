from fastapi import FastAPI
from app.database.connection import SessionLocal, engine
from app.database import database_model
from app.api.router import api_router
database_model.Base.metadata.create_all(bind=engine)


app = FastAPI()
@app.get("/")
def greet():
    return "hello from store"

app.include_router(api_router, prefix="/api/v1")