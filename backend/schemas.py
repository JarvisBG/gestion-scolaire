# backend/schemas.py
from pydantic import BaseModel
from typing import Optional

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
    mot_de_passe: str  # <-- On utilise aussi mot_de_passe ici

class UtilisateurResponse(UtilisateurBase):
    id: int
    est_actif: bool

    class Config:
        from_attributes = True

# Ajoute ceci à la fin de schemas.py
from datetime import date
from typing import Optional
from pydantic import BaseModel

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

# Schéma spécifique pour la modification (tous les champs sont optionnels)
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
        from_attributes = True # Remplace orm_mode=True pour Pydantic V2

# Ajoute ceci à la fin de schemas.py

# Un mini-schéma pour afficher juste le nom du prof sans charger toute sa fiche
class EmployeMinimal(BaseModel):
    id: int
    nom: str
    prenom: str
    
    class Config:
        from_attributes = True

class ClasseBase(BaseModel):
    nom: str
    niveau: str
    salle: str
    professeur_principal_id: Optional[int] = None

class ClasseCreate(ClasseBase):
    pass

class ClasseUpdate(BaseModel):
    nom: Optional[str] = None
    niveau: Optional[str] = None
    salle: Optional[str] = None
    professeur_principal_id: Optional[int] = None

class ClasseResponse(ClasseBase):
    id: int
    # On inclut les infos basiques du prof principal dans la réponse !
    professeur_principal: Optional[EmployeMinimal] = None

    class Config:
        from_attributes = True


from pydantic import BaseModel
from typing import Optional
from datetime import date

# --- SCHÉMAS POUR LES ÉLÈVES ---

class EleveBase(BaseModel):
    matricule: Optional[str] = None
    nom: str
    prenom: str
    date_naissance: date
    classe_id: int
    statut_inscription: Optional[str] = "Inscrit" # Notre nouvelle colonne par défaut
    observations: Optional[str] = None
    date_naissance: Optional[date] = None
    lieu_naissance: Optional[str] = None
    adresse: Optional[str] = None
    telephone_parents: Optional[str] = None
    responsable_legal: Optional[str] = None

class EleveCreate(EleveBase):
    pass

class Eleve(EleveBase):
    id: int

    class Config:
        from_attributes = True  # Permet à Pydantic de lire les modèles SQLAlchemy