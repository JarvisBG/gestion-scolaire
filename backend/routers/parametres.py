from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from dependencies import require_role
import os
import shutil

router = APIRouter(prefix="/parametres", tags=["Paramètres"])

# 1. Obtenir les infos de l'école
@router.get("/", response_model=schemas.EtablissementResponse)
def get_etablissement(db: Session = Depends(get_db)):
    config = db.query(models.Etablissement).first()
    if not config:
        # On crée une configuration par défaut si la table est vide
        config = models.Etablissement(nom="Mon École Moderne")
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

# 2. Mettre à jour les textes (Nom, adresse, etc.)
@router.put("/", response_model=schemas.EtablissementResponse)
def update_etablissement(
    update_data: schemas.EtablissementUpdate, 
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(require_role(["Directeur"]))
):
    config = db.query(models.Etablissement).first()
    for key, value in update_data.model_dump().items():
        setattr(config, key, value)
    db.commit()
    db.refresh(config)
    return config

# 3. Uploader le logo
@router.post("/logo")
def upload_logo(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(require_role(["Directeur"]))
):
    # On vérifie que c'est bien une image
    if not file.filename.endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Format non supporté. Utilisez PNG, JPG ou JPEG.")
    
    # On sauvegarde l'image dans un dossier "uploads"
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    # On met à jour l'URL dans la base de données
    config = db.query(models.Etablissement).first()
    config.logo_url = f"http://127.0.0.1:8000/static/{file.filename}" 
    db.commit()
    
    return {"message": "Logo mis à jour avec succès", "logo_url": config.logo_url}