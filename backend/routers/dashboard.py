from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
import models
from database import get_db

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Statistiques de base
    total_eleves = db.query(models.Eleve).count()
    total_classes = db.query(models.Classe).count()
    total_personnel = db.query(models.Utilisateur).count()
    
    # 2. Répartition Filles/Garçons
    filles = db.query(models.Eleve).filter(models.Eleve.sexe == 'F').count()
    garcons = db.query(models.Eleve).filter(models.Eleve.sexe == 'M').count()

    # 3. Calculs Financiers Globaux
    total_attendu = db.query(func.sum(models.Eleve.scolarite_totale)).scalar() or 0.0
    total_encaisse = db.query(func.sum(models.Paiement.montant)).scalar() or 0.0
    
    # 4. Liste Rouge (Calcul précis et dynamique)
    # L'utilisation de joinedload force SQLAlchemy à charger l'historique financier de chaque élève !
    eleves = db.query(models.Eleve).options(joinedload(models.Eleve.paiements)).all()
    eleves_en_retard = []
    
    for eleve in eleves:
        # Si la scolarité de l'élève est à 0 ou non définie, on l'ignore
        if not eleve.scolarite_totale or eleve.scolarite_totale <= 0:
            continue
            
        # Calcul dynamique de la somme des paiements effectués par cet élève
        deja_paye = sum([p.montant for p in eleve.paiements])
        
        reste_a_payer = eleve.scolarite_totale - deja_paye
        
        # S'il reste un reliquat de paiement, on l'ajoute à la liste d'alerte
        if reste_a_payer > 0:
            eleves_en_retard.append({
                "id": eleve.id,
                "nom": eleve.nom,
                "prenom": eleve.prenom,
                "classe": eleve.classe.nom if eleve.classe else "N/A",
                "reste_a_payer": reste_a_payer,
                "taux_paye": round((deja_paye / eleve.scolarite_totale) * 100)
            })
            
    # Tri décroissant : les plus grosses dettes apparaissent en premier
    eleves_en_retard.sort(key=lambda x: x["reste_a_payer"], reverse=True)

    return {
        "statistiques": {
            "total_eleves": total_eleves,
            "total_classes": total_classes,
            "total_personnel": total_personnel,
            "filles": filles,
            "garcons": garcons
        },
        "finances": {
            "total_attendu": total_attendu,
            "total_encaisse": total_encaisse,
            "taux_recouvrement": round((total_encaisse / total_attendu * 100) if total_attendu > 0 else 0, 1)
        },
        "alertes_paiements": eleves_en_retard[:10]  # Top 10 des débiteurs
    }