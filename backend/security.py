# backend/security.py
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext

# Configuration de la clé secrète (À changer plus tard pour la production !)
SECRET_KEY = "une_cle_secrete_tres_complexe_pour_gestion_scolaire"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # Le token expirera au bout d'une heure

# Contexte de hachage pour les mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Vérifie si le mot de passe en clair correspond au mot de passe haché"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hache le mot de passe pour le stocker en toute sécurité"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Génère un token JWT (le passeport de l'utilisateur)"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt