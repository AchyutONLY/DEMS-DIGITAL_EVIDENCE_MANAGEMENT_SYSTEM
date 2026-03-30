from fastapi import Depends,HTTPException,status
from fastapi.security.oauth2 import OAuth2PasswordBearer
from jose import JWTError,jwt
from datetime import datetime,timedelta
from sqlalchemy.orm import Session 
from datetime import datetime, timezone

from . import database,models
from .schemas import auth

from .config import settings
SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')

def create_access_token(data:dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})

    encoded = jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)

    return encoded


def verify_access_token(token:str, credential_exception):
    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        BadgeNumber: str = payload.get("BadgeNumber")

        if BadgeNumber is None:
            raise credential_exception
        
        token_data = auth.TokenData(BadgeNumber=BadgeNumber)
    except JWTError:
        raise credential_exception
    
    return token_data

def get_current_user(token: str = Depends(oauth2_scheme),db:Session = Depends(database.get_db)):
    credential_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                         detail=f"Could not Verify the Credentials",
                                         headers={"WWW-Authenticate":"Bearer"})
    Token_data = verify_access_token(token,credential_exception)

    user = db.query(models.User).filter(models.User.BadgeNumber == Token_data.BadgeNumber).first()

    if user is None:
        raise credential_exception


    return user