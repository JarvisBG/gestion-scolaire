import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // 👈 On importe NOTRE configuration Axios, pas le axios par défaut !

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      // 👈 On utilise "api.post" et juste la route "/auth/login". 
      // L'adresse de base (Vercel) sera ajoutée automatiquement !
      const response = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // 1. Sauvegarde du Token ET du Rôle
      localStorage.setItem("token", response.data.access_token);
      
      // On récupère le rôle (Si le backend ne l'envoie pas encore, on met "Enseignant" par sécurité)
      const userRole = response.data.role || "Enseignant";
      localStorage.setItem("role", userRole);

      // 2. Redirection intelligente selon le rôle
      if (userRole === "Enseignant") {
        navigate("/planning");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      setError("Identifiants incorrects ou impossible de joindre le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Gestion Scolaire</h2>
        <p className="text-center text-gray-500">Connectez-vous à votre compte</p>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur (Email)</label>
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
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
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
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}