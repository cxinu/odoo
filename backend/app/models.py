# models.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user") # "guest", "user", "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    questions = relationship("Question", back_populates="owner")
    answers = relationship("Answer", back_populates="owner")
    votes = relationship("Vote", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False) # Rich text content
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="questions")
    answers = relationship("Answer", back_populates="question")
    tags = relationship("QuestionTag", back_populates="question")

class Answer(Base):
    __tablename__ = "answers"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False) # Rich text content
    question_id = Column(Integer, ForeignKey("questions.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    is_accepted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="answers")
    question = relationship("Question", back_populates="answers")
    votes = relationship("Vote", back_populates="answer")

class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    questions = relationship("QuestionTag", back_populates="tag")

class QuestionTag(Base):
    __tablename__ = "question_tags"
    question_id = Column(Integer, ForeignKey("questions.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)

    question = relationship("Question", back_populates="tags")
    tag = relationship("Tag", back_populates="questions")

class Vote(Base):
    __tablename__ = "votes"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    answer_id = Column(Integer, ForeignKey("answers.id"), primary_key=True)
    type = Column(Integer, nullable=False) # 1 for upvote, -1 for downvote

    user = relationship("User", back_populates="votes")
    answer = relationship("Answer", back_populates="votes")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
