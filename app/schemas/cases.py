from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CaseBase(BaseModel):
    Title: str
    Type: str
    Status: str
    AssignedOfficerID: int
    Description: Optional[str] = None


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    Title: Optional[str] = None
    Type: Optional[str] = None
    Status: Optional[str] = None
    AssignedOfficerID: Optional[int] = None
    Description: Optional[str] = None


class CaseOut(CaseBase):
    CaseID: int
    DateOpened: datetime
    DateClosed: Optional[datetime]

    model_config = {
        "from_attributes": True
    }