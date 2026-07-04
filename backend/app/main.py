from dotenv import load_dotenv
load_dotenv(override=True)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine
from app.database import database_model
from app.api.router import api_router

database_model.Base.metadata.create_all(bind=engine)


app = FastAPI(title="Enterprise Chatbot API")

# Ensure all variations of localhost are completely allowed
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

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