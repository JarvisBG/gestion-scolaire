from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db

router = APIRouter(prefix="/paiements", tags=["Finances et Paiements"])

@router.post("/", response_model=schemas.PaiementResponse)
def encaisser_paiement(paiement: schemas.PaiementCreate, db: Session = Depends(get_db)):
    nouveau_paiement = models.Paiement(**paiement.model_dump())
    db.add(nouveau_paiement)
    db.commit()
    db.refresh(nouveau_paiement)
    return nouveau_paiement

@router.get("/eleve/{eleve_id}", response_model=list[schemas.PaiementResponse])
def historique_paiements_eleve(eleve_id: int, db: Session = Depends(get_db)):
    # On récupère tous les paiements d'un élève spécifique, du plus récent au plus ancien
    paiements = db.query(models.Paiement)\
                  .filter(models.Paiement.eleve_id == eleve_id)\
                  .order_by(models.Paiement.date_paiement.desc())\
                  .all()
    return paiements