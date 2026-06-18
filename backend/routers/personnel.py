from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import models, schemas
from database import get_db
# On suppose que tu as une dépendance require_role dans dependencies.py ou main.py
# Sinon on peut laisser libre d'accès pour l'instant si tu es le seul testeur

router = APIRouter(prefix="/personnel", tags=["Gestion du Personnel"])

@router.get("/", response_model=list[schemas.EmployeResponse])
def lister_personnel(db: Session = Depends(get_db)):
    return db.query(models.Employe).all()

@router.post("/")
def ajouter_employe(employe: schemas.EmployeCreate, db: Session = Depends(get_db)):
    nouvel_employe = models.Employe(**employe.model_dump())
    
    # On essaie de sauvegarder...
    try:
        db.add(nouvel_employe)
        db.commit()
        db.refresh(nouvel_employe)
        return nouvel_employe
        
    # Si PostgreSQL crie parce que l'email existe déjà, on attrape l'erreur !
    except IntegrityError:
        db.rollback() # On annule l'opération pour ne pas bloquer la base
        raise HTTPException(
            status_code=400, 
            detail="Cet email est déjà utilisé par un autre membre du personnel."
        )

@router.get("/{employe_id}", response_model=schemas.EmployeResponse)
def details_employe(employe_id: int, db: Session = Depends(get_db)):
    employe = db.query(models.Employe).filter(models.Employe.id == employe_id).first()
    if not employe:
        raise HTTPException(status_code=404, detail="Employé introuvable")
    return employe

@router.put("/{employe_id}", response_model=schemas.EmployeResponse)
def modifier_employe(employe_id: int, employe_update: schemas.EmployeUpdate, db: Session = Depends(get_db)):
    employe = db.query(models.Employe).filter(models.Employe.id == employe_id).first()
    if not employe:
        raise HTTPException(status_code=404, detail="Employé introuvable")
    
    # On met à jour uniquement les champs fournis
    update_data = employe_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(employe, key, value)
        
    db.commit()
    db.refresh(employe)
    return employe