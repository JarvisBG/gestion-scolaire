import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // <-- Nouvelle ligne

export default function Login() {
  const navigate = useNavigate(); // <-- Nouvelle ligne (déclare la fonction)
  // 1. Nos variables d'état pour stocker les saisies et les erreurs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Pour faire patienter pendant le chargement

  // 2. La fonction qui s'exécute quand on clique sur "Se connecter"
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche la page de clignoter/recharger
    setError(""); // On réinitialise les erreurs précédentes
    setIsLoading(true);

    try {
      // FastAPI s'attend à recevoir les données sous format "Formulaire" (OAuth2)
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      // 3. On envoie la requête à notre backend FastAPI
      const response = await axios.post("http://localhost:8000/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // 4. Si ça marche, on sauvegarde le jeton de sécurité
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
      
      // (Plus tard, on ajoutera ici la redirection vers le Tableau de Bord)

    } catch (err) {
      // 5. Si le mot de passe est faux ou le serveur éteint
      setError("Identifiants incorrects ou impossible de joindre le serveur.");
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  };

  // 6. L'interface visuelle (Le HTML / Tailwind CSS)
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Gestion Scolaire
        </h2>
        <p className="text-center text-gray-500">Connectez-vous à votre compte</p>

        {/* Bloc d'affichage de l'erreur en rouge */}
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {/* Le formulaire */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom d'utilisateur (Email)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="directeur@ecole.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

      </div>
    </div>
  );
}