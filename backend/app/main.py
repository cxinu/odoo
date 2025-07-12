# main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from core.config import settings
from database import engine, Base
from routers import auth, questions, answers, users

# Create tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan,
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(questions.router, prefix="/api/v1/questions", tags=["Questions"])
app.include_router(answers.router, prefix="/api/v1/answers", tags=["Answers"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])

@app.get("/")
def read_root():
    return {"message": "Welcome to StackIt API"}
