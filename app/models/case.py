from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base

class Case(Base):
    __tablename__ = "cases"

    CaseID = Column(Integer, primary_key=True, index=True)
    Title = Column(String, nullable=False)
    Type = Column(String, nullable=False)
    Status = Column(String, nullable=False)
    AssignedOfficerID = Column(Integer, nullable=False)
    DateOpened = Column(DateTime, default=datetime.utcnow)
    DateClosed = Column(DateTime, nullable=True)
    Description = Column(Text, nullable=True)