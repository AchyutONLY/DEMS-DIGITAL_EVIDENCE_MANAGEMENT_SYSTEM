from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.custody import CustodyRecords
from app.schemas.custody import CustodyCreate, CustodyUpdate, CustodyResponse

router = APIRouter(prefix="/custody", tags=["Custody"])

@router.post("/", response_model=CustodyResponse)
def add_custody(data: CustodyCreate, db: Session = Depends(get_db)):
    new_record = CustodyRecords(**data.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@router.get("/", response_model=list[CustodyResponse])
def list_custody(db: Session = Depends(get_db)):
    return db.query(CustodyRecords).all()

@router.get("/{record_id}", response_model=CustodyResponse)
def get_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(CustodyRecords).filter(CustodyRecords.RecordID == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

@router.put("/{record_id}", response_model=CustodyResponse)
def update_record(record_id: int, data: CustodyUpdate, db: Session = Depends(get_db)):
    record = db.query(CustodyRecords).filter(CustodyRecords.RecordID == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return record

@router.delete("/{record_id}")
def delete_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(CustodyRecords).filter(CustodyRecords.RecordID == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    db.delete(record)
    db.commit()
    return {"message": "Record deleted"}