from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from models import AuditLog
from app.schemas.audit import AuditCreate, AuditResponse

router = APIRouter(prefix="/audit", tags=["Audit Log"])

@router.post("/", response_model=AuditResponse)
def create_log(data: AuditCreate, db: Session = Depends(get_db)):
    new_log = AuditLog(**data.dict())
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.get("/", response_model=list[AuditResponse])
def get_logs(db: Session = Depends(get_db)):
    return db.query(AuditLog).all()