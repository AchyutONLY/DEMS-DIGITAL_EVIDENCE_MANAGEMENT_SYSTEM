from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.users import UserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])

from sqlalchemy.exc import SQLAlchemyError

@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        existing = db.query(User).filter(User.BadgeNumber == user.BadgeNumber).first()
        if existing:
            raise HTTPException(status_code=400, detail="BadgeNumber already exists")

        new_user = User(
            Name=user.Name,
            Role=user.Role,
            BadgeNumber=user.BadgeNumber,
            Contact=user.Contact,
            Status=user.Status,
            Password=user.Password
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    except Exception as e:
        db.rollback()
        print(" ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.UserID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.UserID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = data.dict(exclude_unset=True)

    if "Password" in update_data:
        update_data["Password"] = update_data.pop("Password")

    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.UserID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted"}