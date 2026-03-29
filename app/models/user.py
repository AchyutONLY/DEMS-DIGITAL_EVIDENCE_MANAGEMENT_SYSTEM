from sqlalchemy import Column,Integer,String,DateTime
from app.database import Base

class User(Base):
    __tablename__="users"
    UserID=Column(Integer,primary_key=True,index=True)
    Name=Column(String,nullable=False)
    Role=Column(String,nullable=False,default="officer")
    BadgeNumber=Column(String,nullable=False)
    Contact=Column(String)
    Status=Column(String,default="Active")
    LastLogin=Column(DateTime(timezone=True))
    Password=Column(String,nullable=False)