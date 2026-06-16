from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db

router = APIRouter(prefix="/classes", tags=["Gestion des Classes"])

@router.get("/", response_model=list[schemas.ClasseResponse])
def lister_classes(db: Session = Depends(get_db)):
    return db.query(models.Classe).all()

@router.post("/", response_model=schemas.ClasseResponse)
def ajouter_classe(classe: schemas.ClasseCreate, db: Session = Depends(get_db)):
    nouvelle_classe = models.Classe(**classe.model_dump())
    db.add(nouvelle_classe)
    db.commit()
    db.refresh(nouvelle_classe)
    return nouvelle_classe

@router.put("/{classe_id}", response_model=schemas.ClasseResponse)
def modifier_classe(classe_id: int, classe_update: schemas.ClasseUpdate, db: Session = Depends(get_db)):
    classe = db.query(models.Classe).filter(models.Classe.id == classe_id).first()
    if not classe:
        raise HTTPException(status_code=404, detail="Classe introuvable")
    
    update_data = classe_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(classe, key, value)
        
    db.commit()
    db.refresh(classe)
    return classe