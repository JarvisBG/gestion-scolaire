from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db

router = APIRouter(prefix="/matieres", tags=["Matières"])

@router.get("/", response_model=list[schemas.MatiereResponse])
def get_matieres(db: Session = Depends(get_db)):
    return db.query(models.Matiere).order_by(models.Matiere.nom).all()

@router.post("/", response_model=schemas.MatiereResponse)
def create_matiere(matiere: schemas.MatiereCreate, db: Session = Depends(get_db)):
    db_matiere = models.Matiere(**matiere.model_dump())
    db.add(db_matiere)
    db.commit()
    db.refresh(db_matiere)
    return db_matiere

@router.delete("/{matiere_id}")
def delete_matiere(matiere_id: int, db: Session = Depends(get_db)):
    matiere = db.query(models.Matiere).filter(models.Matiere.id == matiere_id).first()
    if not matiere:
        raise HTTPException(status_code=404, detail="Matière introuvable")
    db.delete(matiere)
    db.commit()
    return {"message": "Matière supprimée avec succès"}