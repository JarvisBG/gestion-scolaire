# backend/schemas.py
from pydantic import BaseModel
from typing import Optional, Any
from datetime import date, time

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UtilisateurBase(BaseModel):
    email: str
    nom: str
    prenom: str
    role: str 

class UtilisateurCreate(UtilisateurBase):
    mot_de_passe: str

class UtilisateurResponse(UtilisateurBase):
    id: int
    est_actif: bool

    class Config:
        from_attributes = True

class EmployeBase(BaseModel):
    photo: Optional[str] = None
    nom: str
    prenom: str
    sexe: str
    date_naissance: date
    telephone: str
    email: Optional[str] = None
    adresse: str
    fonction: str
    date_recrutement: date
    statut: str = "Actif"
    observations: Optional[str] = None

class EmployeCreate(EmployeBase):
    pass

class EmployeUpdate(BaseModel):
    photo: Optional[str] = None
    nom: Optional[str] = None
    prenom: Optional[str] = None
    sexe: Optional[str] = None
    date_naissance: Optional[date] = None
    telephone: Optional[str] = None
    email: Optional[str] = None
    adresse: Optional[str] = None
    fonction: Optional[str] = None
    date_recrutement: Optional[date] = None
    statut: Optional[str] = None
    observations: Optional[str] = None
    utilisateur_id: Optional[int] = None

class EmployeResponse(EmployeBase):
    id: int
    utilisateur_id: Optional[int] = None

    class Config:
        from_attributes = True

class EmployeMinimal(BaseModel):
    id: int
    nom: str
    prenom: str
    
    class Config:
        from_attributes = True

class ClasseBase(BaseModel):
    nom: str
    niveau: str
    salle: Optional[str] = None
    prof_principal: Optional[str] = None

class ClasseCreate(ClasseBase):
    pass

class ClasseUpdate(BaseModel):
    nom: Optional[str] = None
    niveau: Optional[str] = None
    salle: Optional[str] = None
    prof_principal: Optional[str] = None

class ClasseResponse(ClasseBase):
    id: int

    class Config:
        from_attributes = True

class EleveBase(BaseModel):
    matricule: Optional[str] = None
    nom: str
    prenom: str
    sexe: Optional[str] = "M" # ✨ LE SAUVEUR DES STATISTIQUES EST LÀ ✨
    date_naissance: Optional[date] = None
    lieu_naissance: Optional[str] = None
    adresse: Optional[str] = None
    telephone_parents: Optional[str] = None
    responsable_legal: Optional[str] = None
    classe_id: int
    statut_inscription: Optional[str] = "Inscrit"
    observations: Optional[str] = None
    scolarite_totale: Optional[float] = 0.0

class EleveCreate(EleveBase):
    pass

class Eleve(EleveBase):
    id: int

    class Config:
        from_attributes = True


class EtablissementBase(BaseModel):
    nom: str
    adresse: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[str] = None
    directeur: Optional[str] = None
    logo_url: Optional[str] = None
    annee_scolaire: Optional[str] = "2025-2026"

class EtablissementUpdate(EtablissementBase):
    pass

class EtablissementResponse(EtablissementBase):
    id: int

    class Config:
        from_attributes = True


class PaiementBase(BaseModel):
    montant: float
    date_paiement: date
    motif: str
    mode_paiement: str
    eleve_id: int

class PaiementCreate(PaiementBase):
    pass

class PaiementResponse(PaiementBase):
    id: int

    class Config:
        from_attributes = True


# --- SCHÉMAS MATIÈRES ---
class MatiereBase(BaseModel):
    nom: str
    couleur: str = "#3B82F6"

class MatiereCreate(MatiereBase):
    pass

class MatiereResponse(MatiereBase):
    id: int
    class Config:
        from_attributes = True


# TOUT EN BAS DU FICHIER :
# ==========================================
# --- SCHÉMAS SALLES ---
# ==========================================
class SalleBase(BaseModel):
    nom: str
    capacite: Optional[int] = None

class SalleCreate(SalleBase):
    pass

class SalleResponse(SalleBase):
    id: int
    class Config:
        from_attributes = True

# ==========================================
# --- SCHÉMAS SÉANCES (CALENDRIER) ---
# ==========================================
class SeanceBase(BaseModel):
    date_seance: date
    heure_debut: time
    heure_fin: time
    matiere_id: int
    prof_id: int
    classe_id: int
    salle_id: Optional[int] = None

class SeanceCreate(SeanceBase):
    pass

class SeanceResponse(SeanceBase):
    id: int
    # Nous n'avons plus besoin des champs "Any", l'ID suffit pour valider la création !
    
    class Config:
        from_attributes = True