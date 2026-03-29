from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.evidence import EvidenceItems
from app.schemas.evidence import EvidenceCreate, EvidenceUpdate, EvidenceResponse

router = APIRouter(prefix="/evidence", tags=["Evidence"])

@router.post("/", response_model=EvidenceResponse)
def add_evidence(data: EvidenceCreate, db: Session = Depends(get_db)):
    new_evidence = EvidenceItems(**data.dict())
    db.add(new_evidence)
    db.commit()
    db.refresh(new_evidence)
    return new_evidence

@router.get("/", response_model=list[EvidenceResponse])
def list_evidence(db: Session = Depends(get_db)):
    return db.query(EvidenceItems).all()

@router.get("/{evidence_id}", response_model=EvidenceResponse)
def get_evidence(evidence_id: int, db: Session = Depends(get_db)):
    ev = db.query(EvidenceItems).filter(EvidenceItems.EvidenceID == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return ev

@router.put("/{evidence_id}", response_model=EvidenceResponse)
def update_evidence(evidence_id: int, data: EvidenceUpdate, db: Session = Depends(get_db)):
    ev = db.query(EvidenceItems).filter(EvidenceItems.EvidenceID == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(ev, field, value)

    db.commit()
    db.refresh(ev)
    return ev

@router.delete("/{evidence_id}")
def delete_evidence(evidence_id: int, db: Session = Depends(get_db)):
    ev = db.query(EvidenceItems).filter(EvidenceItems.EvidenceID == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")

    db.delete(ev)
    db.commit()
    return {"message": "Evidence deleted"}