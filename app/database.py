from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL=os.getenv("DB_URL")

engine=create_engine(DATABASE_URL) # connecting fastapi with db.
SessionLocal=sessionmaker(bind=engine,autoflush=False,autocommit=False) # opened for query , query does its work , closes connection when query overs or reqest overs.

Base=declarative_base() # this is like defineing structure of tuples.

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

