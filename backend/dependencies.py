# backend/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, security

# Indique à FastAPI où les utilisateurs vont s'authentifier
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # On déchiffre le token
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    # On cherche l'utilisateur dans la base de données
    user = db.query(models.Utilisateur).filter(models.Utilisateur.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: models.Utilisateur = Depends(get_current_user)):
    if not current_user.est_actif:
        raise HTTPException(status_code=400, detail="Utilisateur inactif")
    return current_user

# ---- FONCTION MAGIQUE POUR LES RÔLES ----
def require_role(roles_autorises: list[str]):
    def role_checker(current_user: models.Utilisateur = Depends(get_current_active_user)):
        if current_user.role not in roles_autorises:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Opération interdite : Vous n'avez pas les permissions nécessaires"
            )
        return current_user
    return role_checker