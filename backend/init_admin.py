# backend/init_admin.py
from database import SessionLocal
import models, security

def initialiser_directeur():
    db = SessionLocal()
    
    utilisateur_existant = db.query(models.Utilisateur).filter(models.Utilisateur.email == "directeur@ecole.com").first()
    
    if not utilisateur_existant:
        admin = models.Utilisateur(
            email="directeur@ecole.com",
            nom="Admin",
            prenom="Directeur",
            role="Directeur",
            mot_de_passe=security.get_password_hash("admin123"), # <-- Aligné avec models.py
            est_actif=True
        )
        db.add(admin)
        db.commit()
        print("✅ Compte Directeur créé avec succès !")
        print("Email : directeur@ecole.com | Mot de passe : admin123")
    else:
        print("⚠️ Le compte Directeur existe déjà dans la base de données.")
        
    db.close()

if __name__ == "__main__":
    initialiser_directeur()