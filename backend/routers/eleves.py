from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas
from database import get_db

router = APIRouter(
    prefix="/eleves",
    tags=["Élèves"]
)

# 1. Créer un nouvel élève
@router.post("/", response_model=schemas.Eleve)
def create_eleve(eleve: schemas.EleveCreate, db: Session = Depends(get_db)):
    nouveau_eleve = models.Eleve(**eleve.model_dump())
    db.add(nouveau_eleve)
    db.commit()
    db.refresh(nouveau_eleve)
    return nouveau_eleve

# 2. Lire la liste des élèves (AVEC LE SYSTÈME DE TRI AUTOMATIQUE 🚀)
@router.get("/", response_model=List[schemas.Eleve])
def read_eleves(
    skip: int = 0, 
    limit: int = 100, 
    classe_id: Optional[int] = None,
    statut: Optional[str] = None,
    recherche: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Eleve)
    
    # --- FILTRAGE DYNAMIQUE ---
    # Si on demande une classe spécifique
    if classe_id:
        query = query.filter(models.Eleve.classe_id == classe_id)
        
    # Si on cherche par statut (ex: "Inscrit", "Exclu", "Diplômé")
    if statut:
        query = query.filter(models.Eleve.statut_inscription == statut)
        
    # Si on tape un nom ou un prénom dans une barre de recherche
    if recherche:
        query = query.filter(
            (models.Eleve.nom.ilike(f"%{recherche}%")) | 
            (models.Eleve.prenom.ilike(f"%{recherche}%"))
        )
    
    # --- TRI AUTOMATIQUE ---
    # On trie toujours par ordre alphabétique (Nom puis Prénom) pour un affichage propre
    query = query.order_by(models.Eleve.nom, models.Eleve.prenom)
    
    return query.offset(skip).limit(limit).all()

# 3. Récupérer un seul élève via son ID
@router.get("/{eleve_id}", response_model=schemas.Eleve)
def read_eleve(eleve_id: int, db: Session = Depends(get_db)):
    eleve = db.query(models.Eleve).filter(models.Eleve.id == eleve_id).first()
    if eleve is None:
        raise HTTPException(status_code=404, detail="Élève introuvable")
    return eleve

# 4. Mettre à jour un élève (ex: pour changer son statut ou sa classe)
@router.put("/{eleve_id}", response_model=schemas.Eleve)
def update_eleve(eleve_id: int, eleve_update: schemas.EleveBase, db: Session = Depends(get_db)):
    # 1. On cherche l'élève dans la base de données
    db_eleve = db.query(models.Eleve).filter(models.Eleve.id == eleve_id).first()
    if not db_eleve:
        raise HTTPException(status_code=404, detail="Élève non trouvé")
    
    # 2. LA MAGIE EST ICI ✨
    # On transforme les données reçues de React en dictionnaire Python
    update_data = eleve_update.model_dump()
    
    # On boucle sur chaque champ (matricule, nom, adresse, observations...) 
    # et on met à jour le modèle automatiquement
    for key, value in update_data.items():
        setattr(db_eleve, key, value)
        
    # 3. On sauvegarde le tout dans PostgreSQL
    db.commit()
    db.refresh(db_eleve)
    return db_eleve

# 5. Supprimer un élève
@router.delete("/{eleve_id}")
def delete_eleve(eleve_id: int, db: Session = Depends(get_db)):
    eleve = db.query(models.Eleve).filter(models.Eleve.id == eleve_id).first()
    if eleve is None:
        raise HTTPException(status_code=404, detail="Élève introuvable")
    
    db.delete(eleve)
    db.commit()
    return {"message": f"L'élève avec l'ID {eleve_id} a été supprimé."}