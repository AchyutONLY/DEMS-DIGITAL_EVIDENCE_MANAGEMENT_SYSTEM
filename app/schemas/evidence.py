from pydantic import BaseModel
from datetime import datetime

class EvidenceBase(BaseModel):
    CaseID: int
    Description: str | None = None
    EvidenceType: str | None = None
    SourceOrigin: str | None = None
    DateCollected: datetime | None = None
    SubmittingOfficerID: int | None = None

class EvidenceCreate(EvidenceBase):
    pass

class EvidenceUpdate(BaseModel):
    Description: str | None = None
    EvidenceType: str | None = None
    SourceOrigin: str | None = None
    DateCollected: datetime | None = None
    SubmittingOfficerID: int | None = None

class EvidenceResponse(EvidenceBase):
    EvidenceID: int

    class Config:
        orm_mode = True