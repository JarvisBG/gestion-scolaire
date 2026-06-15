# backend/routers/utilisateurs.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, security
from database import get_db
from dependencies import require_role

router = APIRouter(prefix="/utilisateurs", tags=["Gestion des Utilisateurs"])

@router.post("/", response_model=schemas.UtilisateurResponse)
def creer_utilisateur(
    utilisateur: schemas.UtilisateurCreate, 
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(require_role(["Directeur"]))
):
    email_existant = db.query(models.Utilisateur).filter(models.Utilisateur.email == utilisateur.email).first()
    if email_existant:
        raise HTTPException(status_code=400, detail="Un compte avec cet email existe déjà.")
    
    nouvel_utilisateur = models.Utilisateur(
        email=utilisateur.email,
        nom=utilisateur.nom,
        prenom=utilisateur.prenom,
        role=utilisateur.role,
        mot_de_passe=security.get_password_hash(utilisateur.mot_de_passe), # <-- Aligné avec models.py
        est_actif=True
    )
    
    db.add(nouvel_utilisateur)
    db.commit()
    db.refresh(nouvel_utilisateur) 
    
    return nouvel_utilisateur

@router.get("/", response_model=list[schemas.UtilisateurResponse])
def lister_utilisateurs(
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(require_role(["Directeur", "Secrétaire"]))
):
    utilisateurs = db.query(models.Utilisateur).all()
    return utilisateurs