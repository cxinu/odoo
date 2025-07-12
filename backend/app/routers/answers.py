# routers/answers.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db
from schemas import AnswerCreate, AnswerResponse, VoteCreate
from crud import create_answer, get_answers_for_question, update_answer_accepted_status, create_vote, get_vote, delete_vote
from core.security import get_current_user
from models import User, Answer, Question

router = APIRouter()

@router.post("/", response_model=AnswerResponse, status_code=status.HTTP_201_CREATED)
async def post_answer(
    answer: AnswerCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only logged-in users can post answers
    if current_user.role == "guest":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Guest users cannot post answers."
        )
    return await create_answer(db=db, answer=answer, user_id=current_user.id)

@router.get("/question/{question_id}", response_model=List[AnswerResponse])
async def get_answers(question_id: int, db: AsyncSession = Depends(get_db)):
    answers = await get_answers_for_question(db, question_id)
    return answers

@router.patch("/{answer_id}/accept", response_model=AnswerResponse)
async def accept_answer(
    answer_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    answer = await db.get(Answer, answer_id)
    if not answer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Answer not found")

    question = await db.get(Question, answer.question_id)
    if not question or question.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the question owner can accept an answer."
        )

    return await update_answer_accepted_status(db, answer_id, True)

@router.post("/{answer_id}/vote", status_code=status.HTTP_200_OK)
async def vote_answer(
    answer_id: int,
    vote: VoteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    existing_vote = await get_vote(db, current_user.id, answer_id)
    if existing_vote:
        if existing_vote.type == vote.type:
            # User is trying to vote the same way again, so remove the vote
            await delete_vote(db, current_user.id, answer_id)
            return {"message": "Vote removed successfully"}
        else:
            # User is changing their vote, update the existing one
            existing_vote.type = vote.type
            await db.commit()
            await db.refresh(existing_vote)
            return {"message": "Vote updated successfully"}
    else:
        # Create a new vote
        new_vote = VoteCreate(answer_id=answer_id, type=vote.type)
        await create_vote(db, new_vote, current_user.id)
        return {"message": "Vote cast successfully"}
