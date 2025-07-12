from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

env_loaded = load_dotenv()
if not env_loaded:
    raise RuntimeError("Failed to load environment variables from .env file")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment.")

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_connection():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 'Hello, StackIt!'"))
        for row in result:
            print("✅ DB says:", row[0])
