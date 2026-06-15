# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Remplace 'ton_mot_de_passe' par ton mot de passe PostgreSQL
# Format : postgresql://utilisateur:mot_de_passe@serveur:port/nom_de_la_base
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:Password@127.0.0.1:5432/gestion_scolaire"

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