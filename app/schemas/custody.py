from pydantic import BaseModel
from datetime import datetime

class CustodyBase(BaseModel):
    EvidenceID: int
    Timestamp: datetime | None = None
    ActingOfficerID: int
    Notes: str | None = None

class CustodyCreate(CustodyBase):
    pass

class CustodyUpdate(BaseModel):
    Timestamp: datetime | None = None
    ActingOfficerID: int | None = None
    Notes: str | None = None

class CustodyResponse(CustodyBase):
    RecordID: int

    class Config:
        from_attributes = True