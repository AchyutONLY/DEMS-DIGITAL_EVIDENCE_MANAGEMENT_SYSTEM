from pydantic import BaseModel
from datetime import datetime

class AuditBase(BaseModel):
    Timestamp: datetime | None = None
    UserID: int
    EventType: str
    Signature: str | None = None

class AuditCreate(AuditBase):
    pass

class AuditResponse(AuditBase):
    LogID: int

    class Config:
        from_attributes = True