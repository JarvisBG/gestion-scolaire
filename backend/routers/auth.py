# backend/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models, schemas, security
from database import get_db

router = APIRouter(prefix="/auth", tags=["Authentification"])

# J'ai retiré 'response_model=schemas.Token' pour que FastAPI ne bloque pas notre champ "role"
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. On cherche l'utilisateur par son email
    user = db.query(models.Utilisateur).filter(models.Utilisateur.email == form_data.username).first()
    
    # 2. On vérifie le mot de passe
    if not user or not security.verify_password(form_data.password, user.mot_de_passe):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. LE VIGILE : On bloque strictement si le compte est suspendu
    if not user.est_actif:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Ce compte a été suspendu par l'administration."
        )

    # 4. On génère le passeport (Token JWT)
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role}
    )
    
    # 5. On renvoie TOUT au frontend (y compris le rôle !)
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.role 
    }