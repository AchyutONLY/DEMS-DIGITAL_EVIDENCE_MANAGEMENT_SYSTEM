from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database import Base

class AuditLog(Base):
    __tablename__ = "auditlog"

    LogID = Column(Integer, primary_key=True, index=True)
    Timestamp = Column(DateTime(timezone=True))
    UserID = Column(Integer, ForeignKey("users.UserID"))
    EventType = Column(String)
    Signature = Column(String)