# backend/models.py
from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base

class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    nom = Column(String)
    prenom = Column(String)
    role = Column(String)
    mot_de_passe = Column(String)  # <-- C'est ce champ précis qui posait problème
    est_actif = Column(Boolean, default=True)

class Classe(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, unique=True, index=True, nullable=False) # Ex: 6ème A
    niveau = Column(String, nullable=False)
    annee_scolaire = Column(String, nullable=False) # Ex: 2025-2026

    eleves = relationship("Eleve", back_populates="classe")
    matieres = relationship("Matiere", back_populates="classe")

class Eleve(Base):
    __tablename__ = "eleves"

    id = Column(Integer, primary_key=True, index=True)
    matricule = Column(String, unique=True, index=True, nullable=False)
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)
    date_naissance = Column(Date, nullable=False)
    sexe = Column(String, nullable=False)
    classe_id = Column(Integer, ForeignKey("classes.id"))

    classe = relationship("Classe", back_populates="eleves")
    notes = relationship("Note", back_populates="eleve")

class Matiere(Base):
    __tablename__ = "matieres"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    coefficient = Column(Integer, nullable=False, default=1)
    enseignant_id = Column(Integer, ForeignKey("utilisateurs.id"))
    classe_id = Column(Integer, ForeignKey("classes.id"))

    classe = relationship("Classe", back_populates="matieres")
    enseignant = relationship("Utilisateur")
    notes = relationship("Note", back_populates="matiere")

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    valeur = Column(Float, nullable=False)
    sequence = Column(String, nullable=False) # Ex: Trimestre 1, Séquence 2
    eleve_id = Column(Integer, ForeignKey("eleves.id"))
    matiere_id = Column(Integer, ForeignKey("matieres.id"))

    eleve = relationship("Eleve", back_populates="notes")
    matiere = relationship("Matiere", back_populates="notes")