# backend/routers/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models
from database import get_db

router = APIRouter(prefix="/dashboard", tags=["Tableau de Bord"])

@router.get("/stats")
def obtenir_statistiques(db: Session = Depends(get_db)):
    # Récupération des vraies données (Utilisateurs)
    total_personnel = db.query(models.Utilisateur).count()
    total_enseignants = db.query(models.Utilisateur).filter(models.Utilisateur.role == "Enseignant").count()
    
    # Pour les élèves et classes (compteurs à 0 si les tables sont vides pour l'instant)
    total_eleves = db.query(models.Eleve).count() if hasattr(models, "Eleve") else 0
    total_classes = db.query(models.Classe).count() if hasattr(models, "Classe") else 0

    # Nous renvoyons une structure complète. 
    # Les données complexes (Sexe, Graphiques) sont simulées en attendant la création de leurs modules.
    return {
        "annee_active": "2025-2026",
        "effectifs": {
            "total": total_eleves,
            "garcons": total_eleves // 2,
            "filles": total_eleves - (total_eleves // 2)
        },
        "classes": total_classes,
        "personnel": {
            "enseignants": total_enseignants,
            "total": total_personnel
        },
        "alertes": [
            {"id": 1, "message": "Validation des notes du 1er trimestre en attente", "type": "warning"},
            {"id": 2, "message": "Réunion parents-professeurs ce vendredi à 16h", "type": "info"}
        ],
        "eleves_recents": [
            # La liste se remplira quand on aura codé la création d'élèves
        ],
        "graphique_inscriptions": [
            {"mois": "Sept", "élèves": 120},
            {"mois": "Oct", "élèves": 135},
            {"mois": "Nov", "élèves": 140},
            {"mois": "Déc", "élèves": 142},
            {"mois": "Jan", "élèves": 150}
        ]
    }