# backend/main.py
from fastapi import FastAPI
from routers import auth, utilisateurs # On importe le nouveau routeur
import models
from database import engine
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, utilisateurs, dashboard, personnel, classes

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Gestion Scolaire Moderne")

# ==========================================
# CONFIGURATION CORS (A ajouter obligatoirement)
# ==========================================
origins = [
    "http://localhost:5173",     # Si tu utilises localhost
    "http://127.0.0.1:5173",     # Si ton navigateur utilise l'IP locale
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Autorise les adresses définies au-dessus
    allow_credentials=True,
    allow_methods=["*"],         # Autorise toutes les méthodes (GET, POST, PUT, DELETE)
    allow_headers=["*"],         # Autorise tous les en-têtes
)
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Autorise toutes les méthodes (GET, POST, etc.)
    allow_headers=["*"], # Autorise tous les en-têtes
)

# On connecte les routeurs à l'application
app.include_router(auth.router)
app.include_router(utilisateurs.router) # La nouvelle ligne est ici !
app.include_router(dashboard.router)
app.include_router(personnel.router)
app.include_router(classes.router)

@app.get("/")
def racine():
    return {"message": "L'API est en ligne et sécurisée !"}