import os

if os.getenv("VERCEL") is None:
    from dotenv import load_dotenv
    load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine
from app.database import database_model
from app.api.router import api_router


database_model.Base.metadata.create_all(bind=engine)


app = FastAPI(title="Enterprise Chatbot API")

FRONTEND_URL = os.getenv("FRONTEND_URL")

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if FRONTEND_URL:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
    expose_headers=["*"]
)

@app.get("/")
def greet():
    return "hello from store"

app.include_router(api_router, prefix="/api/v1")