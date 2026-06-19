from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
import models, schemas
from database import get_db

router = APIRouter(prefix="/calendrier", tags=["Calendrier et Salles"])

# ==========================================
# 1. GESTION DES SALLES DE CLASSE
# ==========================================

@router.post("/salles/", response_model=schemas.SalleResponse)
def create_salle(salle: schemas.SalleCreate, db: Session = Depends(get_db)):
    # Vérifier si le nom de la salle existe déjà
    salle_existante = db.query(models.Salle).filter(models.Salle.nom == salle.nom).first()
    if salle_existante:
        raise HTTPException(status_code=400, detail="Une salle porte déjà ce nom.")
    
    nouvelle_salle = models.Salle(**salle.model_dump())
    db.add(nouvelle_salle)
    db.commit()
    db.refresh(nouvelle_salle)
    return nouvelle_salle

@router.get("/salles/", response_model=list[schemas.SalleResponse])
def get_salles(db: Session = Depends(get_db)):
    return db.query(models.Salle).order_by(models.Salle.nom).all()


# ==========================================
# 2. GESTION DES SÉANCES (LE MOTEUR ANTI-COLLISION)
# ==========================================

@router.post("/seances/", response_model=schemas.SeanceResponse)
def create_seance(seance: schemas.SeanceCreate, db: Session = Depends(get_db)):
    
    chevauchements = db.query(models.Seance).filter(
        models.Seance.date_seance == seance.date_seance,
        models.Seance.heure_debut < seance.heure_fin,
        models.Seance.heure_fin > seance.heure_debut
    ).all()

    for cours_existant in chevauchements:
        # Règle 1 : La salle commune ne peut pas accueillir deux classes (Seulement si une salle spéciale est choisie)
        if seance.salle_id is not None and cours_existant.salle_id == seance.salle_id:
            raise HTTPException(status_code=400, detail="Collision : Cette salle commune est déjà occupée sur ce créneau.")
        
        # Règle 2 : Le professeur
        if cours_existant.prof_id == seance.prof_id:
            raise HTTPException(status_code=400, detail="Collision : Ce professeur donne déjà un cours sur ce créneau.")
            
        # Règle 3 : La classe
        if cours_existant.classe_id == seance.classe_id:
            raise HTTPException(status_code=400, detail="Collision : Cette classe a déjà un cours programmé à cette heure.")

    nouvelle_seance = models.Seance(**seance.model_dump())
    db.add(nouvelle_seance)
    db.commit()
    db.refresh(nouvelle_seance)
    return nouvelle_seance


@router.get("/seances/")
def get_seances(date_debut: str = None, date_fin: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Seance)
    
    if date_debut:
        query = query.filter(models.Seance.date_seance >= date_debut)
    if date_fin:
        query = query.filter(models.Seance.date_seance <= date_fin)
        
    seances = query.order_by(models.Seance.date_seance, models.Seance.heure_debut).all()
    
    resultat = []
    for s in seances:
        # On détermine le nom de la salle dynamiquement
        if s.salle:
            nom_salle = s.salle.nom # C'est une salle spéciale (Labo, Sport...)
        elif s.classe and s.classe.salle:
            nom_salle = s.classe.salle # C'est la salle par défaut (B12)
        else:
            nom_salle = "Salle habituelle" # Fallback

        resultat.append({
            "id": s.id,
            "date_seance": s.date_seance,
            "heure_debut": s.heure_debut,
            "heure_fin": s.heure_fin,
            "matiere_nom": s.matiere.nom if s.matiere else "Inconnu",
            "prof_nom": f"{s.prof.nom} {s.prof.prenom}" if s.prof else "Inconnu",
            "classe_nom": f"{s.classe.niveau} {s.classe.nom}" if s.classe else "Inconnu",
            "salle_nom": nom_salle
        })
        
    return resultat

@router.delete("/seances/{seance_id}")
def delete_seance(seance_id: int, db: Session = Depends(get_db)):
    seance = db.query(models.Seance).filter(models.Seance.id == seance_id).first()
    if not seance:
        raise HTTPException(status_code=404, detail="Séance introuvable")
    
    db.delete(seance)
    db.commit()
    return {"message": "Cours annulé et retiré du calendrier"}