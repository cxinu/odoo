from fastapi import FastAPI
from app.db import test_connection

app = FastAPI()

test_connection()

@app.get("/")
def read_root():
    return {"message": "Hello, StackIt!"}
