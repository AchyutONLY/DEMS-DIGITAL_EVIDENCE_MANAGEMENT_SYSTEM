from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.hashing import verify_password
from app.utils.auth import create_access_token
from app.schemas.auth import LoginRequest

router = APIRouter(prefix="/login", tags=["Auth"])

@router.post("/")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.Username == request.username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(request.password, user.Password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    token = create_access_token({"user_id": user.UserID, "role": user.Role})

    return {"access_token": token, "token_type": "bearer"}