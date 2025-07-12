from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from models import User, Question, Answer, Tag, QuestionTag, Vote, Notification
from schemas import (
    UserCreate, QuestionCreate, AnswerCreate, VoteCreate
)
from core.security import get_password_hash

# User CRUD
async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(User).filter(User.username == username))
    return result.scalar_one_or_none()

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalar_one_or_none()

async def create_user(db: AsyncSession, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

# Question CRUD
async def get_questions(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Question).offset(skip).limit(limit).options(selectinload(Question.tags)))
    return result.scalars().all()

async def get_question(db: AsyncSession, question_id: int):
    result = await db.execute(select(Question).filter(Question.id == question_id).options(selectinload(Question.tags)))
    return result.scalar_one_or_none()

async def create_question(db: AsyncSession, question: QuestionCreate, user_id: int):
    db_question = Question(title=question.title, description=question.description, owner_id=user_id)
    db.add(db_question)
    await db.flush() # To get the question ID for tags

    for tag_name in question.tags:
        tag = await get_or_create_tag(db, tag_name)
        db_question_tag = QuestionTag(question_id=db_question.id, tag_id=tag.id)
        db.add(db_question_tag)

    await db.commit()
    await db.refresh(db_question)
    return db_question

# Answer CRUD
async def get_answers_for_question(db: AsyncSession, question_id: int):
    result = await db.execute(select(Answer).filter(Answer.question_id == question_id))
    return result.scalars().all()

async def create_answer(db: AsyncSession, answer: AnswerCreate, user_id: int):
    db_answer = Answer(content=answer.content, question_id=answer.question_id, owner_id=user_id)
    db.add(db_answer)
    await db.commit()
    await db.refresh(db_answer)
    return db_answer

async def update_answer_accepted_status(db: AsyncSession, answer_id: int, is_accepted: bool):
    db_answer = await db.get(Answer, answer_id)
    if db_answer:
        db_answer.is_accepted = is_accepted
        await db.commit()
        await db.refresh(db_answer)
    return db_answer

# Tag CRUD
async def get_or_create_tag(db: AsyncSession, tag_name: str):
    result = await db.execute(select(Tag).filter(Tag.name == tag_name))
    tag = result.scalar_one_or_none()
    if not tag:
        tag = Tag(name=tag_name)
        db.add(tag)
        await db.flush() # To get the tag ID
    return tag

# Vote CRUD
async def create_vote(db: AsyncSession, vote: VoteCreate, user_id: int):
    db_vote = Vote(user_id=user_id, answer_id=vote.answer_id, type=vote.type)
    db.add(db_vote)
    await db.commit()
    await db.refresh(db_vote)
    return db_vote

async def get_vote(db: AsyncSession, user_id: int, answer_id: int):
    result = await db.execute(select(Vote).filter(Vote.user_id == user_id, Vote.answer_id == answer_id))
    return result.scalar_one_or_none()

async def delete_vote(db: AsyncSession, user_id: int, answer_id: int):
    result = await db.execute(delete(Vote).filter(Vote.user_id == user_id, Vote.answer_id == answer_id))
    await db.commit()
    return result.rowcount > 0

# Notification CRUD (initial thoughts, needs refinement for real-time)
async def create_notification(db: AsyncSession, user_id: int, message: str):
    notification = Notification(user_id=user_id, message=message)
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification

async def get_unread_notifications(db: AsyncSession, user_id: int):
    result = await db.execute(select(Notification).filter(Notification.user_id == user_id, Notification.is_read == False))
    return result.scalars().all()

async def mark_notification_as_read(db: AsyncSession, notification_id: int):
    notification = await db.get(Notification, notification_id)
    if notification:
        notification.is_read = True
        await db.commit()
        await db.refresh(notification)
    return notification
