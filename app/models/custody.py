from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database import Base

class CustodyRecords(Base):
    __tablename__ = "custodyrecords"

    RecordID = Column(Integer, primary_key=True, index=True)
    EvidenceID = Column(Integer, ForeignKey("evidenceitems.EvidenceID"))
    Timestamp = Column(DateTime(timezone=True))
    ActingOfficerID = Column(Integer, ForeignKey("users.UserID"))
    Notes = Column(String)