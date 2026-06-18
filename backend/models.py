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
    mot_de_passe = Column(String)  # <-- C'est ce champ précis qui posait problème
    est_actif = Column(Boolean, default=True)

# Trouve ou ajoute la table Classe dans models.py
class Classe(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, index=True) # Ex: 6ème A
    niveau = Column(String) # Ex: Collège
    salle = Column(String) # Ex: B12
    matieres = relationship("Matiere", back_populates="classe")
    
    # Clé étrangère pour relier au Professeur Principal (table employes)
    professeur_principal_id = Column(Integer, ForeignKey("employes.id"), nullable=True)
    
    # Permet de récupérer automatiquement les infos de l'employé lié
    professeur_principal = relationship("Employe")
    eleves = relationship("Eleve", back_populates="classe")

class Eleve(Base):
    __tablename__ = "eleves"

    id = Column(Integer, primary_key=True, index=True)
    matricule = Column(String, unique=True, index=True)
    nom = Column(String, index=True)
    prenom = Column(String)
    sexe = Column(String)
    date_naissance = Column(Date)
    date_naissance = Column(Date, nullable=True)
    lieu_naissance = Column(String, nullable=True)
    adresse = Column(String, nullable=True)
    telephone_parents = Column(String, nullable=True)
    responsable_legal = Column(String, nullable=True)
    
    # ✨ LA NOUVELLE COLONNE EST ICI ✨
    statut_inscription = Column(String, default="Inscrit")
    observations = Column(Text, nullable=True)

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

# Ajoute ceci à la fin de models.py
from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship

class Employe(Base):
    __tablename__ = "employes"

    id = Column(Integer, primary_key=True, index=True)
    photo = Column(String, nullable=True) # Lien vers l'image
    nom = Column(String, index=True)
    prenom = Column(String)
    sexe = Column(String)
    date_naissance = Column(Date)
    telephone = Column(String)
    email = Column(String, unique=True, index=True, nullable=True)
    adresse = Column(String)
    fonction = Column(String) # Ex: Enseignant, Secrétaire, Vigile...
    date_recrutement = Column(Date)
    statut = Column(String, default="Actif")
    observations = Column(Text, nullable=True)
    
    # Lien optionnel vers un compte de connexion (Utilisateur)
    utilisateur_id = Column(Integer, ForeignKey("utilisateurs.id"), unique=True, nullable=True)
    utilisateur = relationship("Utilisateur")