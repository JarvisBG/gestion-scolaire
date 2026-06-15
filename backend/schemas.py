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