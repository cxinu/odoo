# routers/questions.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db
from schemas import QuestionCreate, QuestionResponse
from crud import create_question, get_questions, get_question
from core.security import get_current_user
from models import User

router = APIRouter()

@router.post("/", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def ask_question(
    question: QuestionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only logged-in users can ask questions
    if current_user.role == "guest":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Guest users cannot ask questions."
        )
    return await create_question(db=db, question=question, user_id=current_user.id)

@router.get("/", response_model=List[QuestionResponse])
async def read_questions(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    questions = await get_questions(db, skip=skip, limit=limit)
    return questions

@router.get("/{question_id}", response_model=QuestionResponse)
async def read_question(question_id: int, db: AsyncSession = Depends(get_db)):
    question = await get_question(db, question_id=question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return question

# TODO: Add update and delete question endpoints with proper authorization
