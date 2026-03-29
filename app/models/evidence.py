from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database import Base

class EvidenceItems(Base):
    __tablename__ = "evidenceitems"

    EvidenceID = Column(Integer, primary_key=True, index=True)
    CaseID = Column(Integer, ForeignKey("cases.CaseID"))
    Description = Column(String)
    EvidenceType = Column(String)
    SourceOrigin = Column(String)
    DateCollected = Column(DateTime(timezone=True))
    SubmittingOfficerID = Column(Integer, ForeignKey("users.UserID"))