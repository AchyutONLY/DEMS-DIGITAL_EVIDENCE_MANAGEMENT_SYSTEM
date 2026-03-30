from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import EvidenceItems,User,Case
from app.schemas.evidence import EvidenceCreate, EvidenceUpdate, EvidenceResponse
from app.schemas.role import RoleEnum
from .. import oauth2
from typing import Optional
router = APIRouter(prefix="/evidence", tags=["Evidence"])

@router.post("/",status_code=status.HTTP_201_CREATED, response_model=EvidenceResponse)
def add_evidence(data: EvidenceCreate, db: Session = Depends(get_db),current_user:User = Depends(oauth2.get_current_user)):
    case = db.query(Case).filter(Case.CaseID == data.CaseID).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not case Found"
        )
    if current_user.Role == RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins cant interfer in Any Evidence Tampering"
        )
    
    new_evidence = EvidenceItems(**data.dict(),SubmittingOfficerID = current_user.UserID)
    db.add(new_evidence)
    db.commit()
    db.refresh(new_evidence)
    return new_evidence


@router.get("/case/{case_id}", response_model=list[EvidenceResponse])
def list_evidence(case_id:int,db: Session = Depends(get_db),current_user:User = Depends(oauth2.get_current_user),limit: int = 10,
                 skip: int = 0,
                search: Optional[str] = None):
    case = db.query(Case).filter(Case.CaseID == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                             detail="Case not found")

    if current_user.Role == RoleEnum.officer:
        if case.AssignedOfficerID != current_user.UserID:
            raise HTTPException(status_code=403, detail="Not your case")
    
    query = db.query(EvidenceItems).filter(EvidenceItems.CaseID == case_id)

    if search:
        query = query.filter(EvidenceItems.Description.ilike(f"%{search}%"))

    return query.offset(skip).limit(limit).all()
    


@router.get("/{evidence_id}", response_model=EvidenceResponse)
def get_evidence(evidence_id: int, db: Session = Depends(get_db),
                 current_user:User = Depends(oauth2.get_current_user)):
    
    case = db.query(Case).filter(Case.CaseID == ev.CaseID).first()

    if current_user.Role == RoleEnum.officer:
        if case.AssignedOfficerID != current_user.UserID:
            raise HTTPException(status_code=403, detail="Not your case")
    
    ev = db.query(EvidenceItems).filter(EvidenceItems.EvidenceID == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Evidence not found")
    return ev


@router.put("/{evidence_id}", response_model=EvidenceResponse)
def update_evidence(evidence_id: int, data: EvidenceUpdate, db: Session = Depends(get_db),current_user:User = Depends(oauth2.get_current_user)):
    ev = db.query(EvidenceItems).filter(EvidenceItems.EvidenceID == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")
    case = db.query(Case).filter(Case.CaseID == ev.CaseID).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND
                            , detail="No Case Has been assigned to you")
    if current_user.Role == RoleEnum.officer:
        if case.AssignedOfficerID != current_user.UserID:
            raise HTTPException(status_code=403, detail="Not your case")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ev, field, value)

    db.commit()
    db.refresh(ev)
    return ev

@router.delete("/{evidence_id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_evidence(evidence_id: int, db: Session = Depends(get_db),current_user:User = Depends(oauth2.get_current_user)):
    if current_user.Role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Officers/Inspector cannot delete a Evidence"
        )
    ev = db.query(EvidenceItems).filter(EvidenceItems.EvidenceID == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")

    db.delete(ev)
    db.commit()
