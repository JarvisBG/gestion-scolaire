# backend/main.py
from fastapi import FastAPI
from routers import auth, utilisateurs # On importe le nouveau routeur
import models
from database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Gestion Scolaire Moderne")

# On connecte les routeurs à l'application
app.include_router(auth.router)
app.include_router(utilisateurs.router) # La nouvelle ligne est ici !

@app.get("/")
def racine():
    return {"message": "L'API est en ligne et sécurisée !"}