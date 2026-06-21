# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. On récupère l'URL depuis le serveur Cloud (ex: Render, Neon)
# Si elle n'existe pas (quand tu codes sur ton PC), on utilise ta base locale par défaut
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:Password@127.0.0.1:5432/gestion_scolaire"
)

# 2. Petite sécurité : SQLAlchemy exige "postgresql://" et non "postgres://"
# Certains hébergeurs cloud donnent des URL commençant par "postgres://"
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dépendance pour obtenir la session de la base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()