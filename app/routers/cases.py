from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.case import Case
from app.models.user import User
from app.schemas.cases import CaseCreate, CaseUpdate, CaseOut


router = APIRouter(prefix="/cases", tags=["Cases"])

@router.post("/", response_model=CaseOut)
def create_case(case: CaseCreate, db: Session = Depends(get_db)):

    officer = db.query(User).filter(User.UserID == case.AssignedOfficerID).first()
    if not officer:
        raise HTTPException(status_code=400, detail="Assigned officer does not exist")

    new_case = Case(
        Title=case.Title,
        Type=case.Type,
        Status=case.Status,
        AssignedOfficerID=case.AssignedOfficerID,
        Description=case.Description,
        DateOpened=datetime.utcnow()
    )

    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    return new_case

@router.get("/", response_model=list[CaseOut])
def get_cases(db: Session = Depends(get_db)):
    return db.query(Case).all()

@router.get("/{case_id}", response_model=CaseOut)
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.CaseID == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.put("/{case_id}", response_model=CaseOut)
def update_case(case_id: int, update_data: CaseUpdate, db: Session = Depends(get_db)):

    case = db.query(Case).filter(Case.CaseID == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if update_data.AssignedOfficerID:
        officer = db.query(User).filter(User.UserID == update_data.AssignedOfficerID).first()
        if not officer:
            raise HTTPException(status_code=400, detail="Assigned officer does not exist")

    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(case, key, value)

    db.commit()
    db.refresh(case)

    return case

@router.put("/{case_id}/close", response_model=CaseOut)
def close_case(case_id: int, db: Session = Depends(get_db)):

    case = db.query(Case).filter(Case.CaseID == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case.Status = "Closed"
    case.DateClosed = datetime.utcnow()

    db.commit()
    db.refresh(case)

    return case

@router.delete("/{case_id}")
def delete_case(case_id: int, db: Session = Depends(get_db)):

    case = db.query(Case).filter(Case.CaseID == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    db.delete(case)
    db.commit()

    return {"detail": "Case deleted successfully"}