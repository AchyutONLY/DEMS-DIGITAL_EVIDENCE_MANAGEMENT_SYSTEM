from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session
from datetime import datetime,timezone
from typing import Optional
from app.database import get_db
from app.models import Case
from app.models import User
from app.schemas.cases import CaseCreate, CaseUpdate, CaseOut
from app.schemas.role import RoleEnum

from .. import oauth2

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.post("/",status_code=status.HTTP_201_CREATED ,response_model=CaseOut)
def create_case(case: CaseCreate, db: Session = Depends(get_db),current_user:User = Depends(oauth2.get_current_user)):
    if (current_user.Role) == RoleEnum.officer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Officers are not allowed to Create Cases"
        )
    officer = db.query(User).filter(User.UserID == case.AssignedOfficerID).first()
    if not officer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND
                            , detail="Assigned officer Not Found")
    if officer.Role != RoleEnum.officer:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN
                            , detail="Cases Can only Be assigned to Officers")
    
    if officer.Status == "INACTIVE":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST
                            , detail="The Assigned Officer is Inactive cant assign work")

    new_case = Case(
        Title=case.Title,
        Type=case.Type,
        Status=case.Status,
        AssignedOfficerID=case.AssignedOfficerID,
        Description=case.Description,
        DateOpened=datetime.now(timezone.utc)
    )

    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    return new_case


@router.get("/", response_model=list[CaseOut],)
def get_cases(db: Session = Depends(get_db),current_user:User = Depends(oauth2.get_current_user),limit: int = 10,
    skip: int = 0,
    search: Optional[str] = None):
    if (current_user.Role) == RoleEnum.officer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Inspectors/Admins are allowed to see all the cases"
        )
    query = db.query(Case)
    if search:
        query = query.filter(Case.Title.ilike(f"%{search}%"))

    return query.offset(skip).limit(limit).all()


@router.get("/assigned", response_model=list[CaseOut])
def get_case(db: Session = Depends(get_db),current_user:User = Depends(oauth2.get_current_user)):
    case = db.query(Case).filter(Case.AssignedOfficerID == current_user.UserID).all()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND
                            , detail=f"No Cases Have been Assigned to Officer with ID {current_user.UserID}")
    
    return case


@router.put("/{case_id}", response_model=CaseOut)
def update_case(case_id: int, update_data: CaseUpdate, db: Session = Depends(get_db),current_user:User = Depends(oauth2.get_current_user)):
    if (current_user.Role) == RoleEnum.officer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Inspectors/Admins are allowed to update case data"
        )
    case = db.query(Case).filter(Case.CaseID == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND
                            , detail="Case not found")

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
def close_case(case_id: int, db: Session = Depends(get_db),current_user:User = Depends(oauth2.get_current_user)):

    if (current_user.Role) == RoleEnum.officer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Inspectors/Admins are allowed to Close a Case"
        )

    case = db.query(Case).filter(Case.CaseID == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case.Status = "Closed"
    case.DateClosed = datetime.now(timezone.utc)

    db.commit()
    db.refresh(case)

    return case


@router.delete("/{case_id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_case(case_id: int, db: Session = Depends(get_db),current_user:User = Depends(oauth2.get_current_user)):
    if (current_user.Role) != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins are allowed to delete a case data"
        )
    case = db.query(Case).filter(Case.CaseID == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND
                            , detail="Case not found")

    db.delete(case)
    db.commit()

    