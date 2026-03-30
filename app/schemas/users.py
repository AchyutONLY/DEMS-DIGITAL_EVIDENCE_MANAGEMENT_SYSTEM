from pydantic import BaseModel
from datetime import datetime

class UserBase(BaseModel):
    Name: str
    Role: str
    BadgeNumber: str
    Contact: str | None = None
    Status: str = "ACTIVE"


class UserCreate(UserBase):
    Password: str


class UserUpdate(BaseModel):
    Name: str | None = None
    Role: str | None = None
    Contact: str | None = None
    Status: str | None = None
    Password: str | None = None


class UserResponse(UserBase):
    UserID: int
    LastLogin: datetime | None = None

    model_config = {
        "from_attributes": True
    }
class UserResponseCreate(BaseModel):
    UserID: int
    BadgeNumber: str

    model_config = {
        "from_attributes": True
    }