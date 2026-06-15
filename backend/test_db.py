import psycopg2

try:
    # On tente une connexion directe
    conn = psycopg2.connect(
        dbname="gestion_scolaire",
        user="postgres",
        password="Password",
        host="127.0.0.1",
        port="5432" # Change ici si pgAdmin t'a indiqué un autre port !
    )
    print("✅ CONNEXION RÉUSSIE ! Le mot de passe et le port sont bons.")
    conn.close()
except Exception as e:
    print("❌ ERREUR DE CONNEXION :")
    print(e)