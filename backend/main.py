# backend/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import models
from database import engine
from routers import auth, utilisateurs, dashboard, personnel, classes, eleves, parametres, paiements, calendrier, matieres

# Création du dossier uploads s'il n'existe pas (pour le logo de l'école)
os.makedirs("uploads", exist_ok=True)

# Création des tables dans la base de données
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Gestion Scolaire Moderne")

# Montage du dossier statique pour rendre les images accessibles
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# ==========================================
# CONFIGURATION CORS (Pour autoriser le Frontend en ligne)
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         # Autorise toutes les adresses (Vercel, localhost, etc.)
    allow_credentials=True,
    allow_methods=["*"],         # Autorise toutes les méthodes (GET, POST, PUT, DELETE)
    allow_headers=["*"],         # Autorise tous les en-têtes
)
# ==========================================

# On connecte les routeurs à l'application
app.include_router(auth.router)
app.include_router(utilisateurs.router)
app.include_router(dashboard.router)
app.include_router(personnel.router)
app.include_router(classes.router)
app.include_router(eleves.router)
app.include_router(parametres.router)
app.include_router(paiements.router)
app.include_router(calendrier.router)
app.include_router(matieres.router)

@app.get("/")
def racine():
    return {"message": "L'API est en ligne et sécurisée !"}