# backend/schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import date

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

class EleveCreate(EleveBase):
    pass

class Eleve(EleveBase):
    id: int

    class Config:
        from_attributes = True