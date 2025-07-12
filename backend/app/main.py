from fastapi import FastAPI
# from app.api import api_router

app = FastAPI()

# app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "StackIt backend is running 🚀"}
