# backend/models.py
from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from database import Base

class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    nom = Column(String)
    prenom = Column(String)
    role = Column(String)
    mot_de_passe = Column(String)
    est_actif = Column(Boolean, default=True)

class Classe(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, index=True) # Ex: 6ème A
    niveau = Column(String) # Ex: Collège
    salle = Column(String, nullable=True) # Ex: B12
    prof_principal = Column(String, nullable=True) # Le nom du prof envoyé par React
    
    matieres = relationship("Matiere", back_populates="classe")
    eleves = relationship("Eleve", back_populates="classe")

class Eleve(Base):
    __tablename__ = "eleves"

    id = Column(Integer, primary_key=True, index=True)
    matricule = Column(String, unique=True, index=True, nullable=True)
    nom = Column(String, index=True)
    prenom = Column(String)
    sexe = Column(String, nullable=True)
    date_naissance = Column(Date, nullable=True)
    lieu_naissance = Column(String, nullable=True)
    adresse = Column(String, nullable=True)
    telephone_parents = Column(String, nullable=True)
    responsable_legal = Column(String, nullable=True)
    scolarite_totale = Column(Float, default=0.0)
    
    
    statut_inscription = Column(String, default="En attente")
    observations = Column(Text, nullable=True)
    classe_id = Column(Integer, ForeignKey("classes.id"))

    classe = relationship("Classe", back_populates="eleves")
    notes = relationship("Note", back_populates="eleve")
    paiements = relationship("Paiement", back_populates="eleve", cascade="all, delete-orphan")

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
    sequence = Column(String, nullable=False) 
    eleve_id = Column(Integer, ForeignKey("eleves.id"))
    matiere_id = Column(Integer, ForeignKey("matieres.id"))

    eleve = relationship("Eleve", back_populates="notes")
    matiere = relationship("Matiere", back_populates="notes")

class Employe(Base):
    __tablename__ = "employes"

    id = Column(Integer, primary_key=True, index=True)
    photo = Column(String, nullable=True) 
    nom = Column(String, index=True)
    prenom = Column(String)
    sexe = Column(String)
    date_naissance = Column(Date)
    telephone = Column(String)
    email = Column(String, unique=True, index=True, nullable=True)
    adresse = Column(String)
    fonction = Column(String) 
    date_recrutement = Column(Date)
    statut = Column(String, default="Actif")
    observations = Column(Text, nullable=True)
    
    utilisateur_id = Column(Integer, ForeignKey("utilisateurs.id"), unique=True, nullable=True)
    utilisateur = relationship("Utilisateur")

class Etablissement(Base):
    __tablename__ = "etablissement"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, default="Mon École Moderne")
    adresse = Column(String, nullable=True)
    telephone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    directeur = Column(String, nullable=True)
    logo_url = Column(String, nullable=True) # <-- C'est ici qu'on stockera le lien vers l'image


class Paiement(Base):
    __tablename__ = "paiements"

    id = Column(Integer, primary_key=True, index=True)
    montant = Column(Float, nullable=False)
    date_paiement = Column(Date, nullable=False)
    motif = Column(String, nullable=False) # Ex: Inscription, Tranche 1, Tranche 2
    mode_paiement = Column(String, nullable=False) # Ex: Espèces, Orange Money, Virement
    eleve_id = Column(Integer, ForeignKey("eleves.id"))

    eleve = relationship("Eleve", back_populates="paiements")