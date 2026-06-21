import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Settings, Save, UploadCloud, School, Calendar } from "lucide-react";

interface Etablissement {
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  directeur: string;
  logo_url: string | null;
  annee_scolaire: string; // ✨ Le nouveau champ ajouté ici
}

export default function Parametres() {
  const [etablissement, setEtablissement] = useState<Etablissement>({
    nom: "", adresse: "", telephone: "", email: "", directeur: "", logo_url: null, annee_scolaire: "2025-2026"
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchEtablissement();
  }, []);

  const fetchEtablissement = async () => {
    try {
      const response = await api.get("/parametres/");
      if (response.data) {
          // On s'assure de ne pas écraser une valeur par défaut avec un "null" si la base de données est vide
          setEtablissement({
              ...response.data,
              annee_scolaire: response.data.annee_scolaire || "2025-2026"
          });
      }
    } catch (error) {
      console.error("Erreur de récupération des paramètres", error);
    }
  };

  const handleSaveTextes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      await api.put("/parametres/", etablissement);
      setMessage("✅ Paramètres textuels enregistrés avec succès !");
    } catch (error) {
      console.error("Erreur de sauvegarde", error);
      setMessage("❌ Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogoUpload = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await api.post("/parametres/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEtablissement({ ...etablissement, logo_url: response.data.logo_url });
      setMessage("🖼️ Logo mis à jour avec succès !");
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Erreur d'upload", error);
      setMessage("❌ " + (error.response?.data?.detail || "Erreur d'upload de l'image."));
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Settings className="mr-3 text-blue-600" size={32} />
          Paramètres de l'Établissement
        </h1>
        <p className="text-gray-500 mt-1">Gérez l'identité visuelle et les coordonnées affichées sur les documents officiels.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg font-medium ${message.includes("✅") || message.includes("🖼️") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Colonne de Gauche : Gestion du Logo (Ton design intact) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4 w-full border-b pb-2">Logo Officiel</h2>
          
          <div className="w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden mb-4 p-2">
            {etablissement.logo_url ? (
              <img src={etablissement.logo_url} alt="Logo de l'école" className="w-full h-full object-contain" />
            ) : (
              <School className="w-16 h-16 text-gray-300" />
            )}
          </div>

          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full mb-2">
            <span className="flex items-center justify-center">
              <UploadCloud size={18} className="mr-2" />
              Choisir un fichier
            </span>
            <input 
              type="file" 
              className="hidden" 
              accept=".jpg,.jpeg,.png"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
            />
          </label>
          
          {selectedFile && (
            <div className="w-full">
              <p className="text-xs text-blue-600 font-medium mb-2 truncate">Fichier prêt : {selectedFile.name}</p>
              <button 
                onClick={handleLogoUpload}
                disabled={isSaving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
              >
                {isSaving ? "Upload..." : "Sauvegarder le logo"}
              </button>
            </div>
          )}
        </div>

        {/* Colonne de Droite : Coordonnées textuelles */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Paramètres de l'école</h2>
          
          <form onSubmit={handleSaveTextes} className="space-y-4">
            
            {/* ✨ NOUVEAU : ENCADRÉ ANNÉE SCOLAIRE ✨ */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between mb-2">
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-1 flex items-center">
                  <Calendar size={18} className="mr-2" /> Année Scolaire Active
                </label>
                <p className="text-xs text-blue-700">Modifiez ceci lors de la rentrée scolaire.</p>
              </div>
              <input 
                type="text" 
                required 
                value={etablissement.annee_scolaire || "2025-2026"} 
                onChange={(e) => setEtablissement({ ...etablissement, annee_scolaire: e.target.value })} 
                className="w-32 md:w-48 p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-center text-blue-900 bg-white" 
                placeholder="Ex: 2025-2026" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom officiel de l'école *</label>
              <input type="text" required value={etablissement.nom || ""} onChange={(e) => setEtablissement({ ...etablissement, nom: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Directeur / Principal</label>
                <input type="text" value={etablissement.directeur || ""} onChange={(e) => setEtablissement({ ...etablissement, directeur: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: M. Jean Dupont" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="text" value={etablissement.telephone || ""} onChange={(e) => setEtablissement({ ...etablissement, telephone: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
              <input type="email" value={etablissement.email || ""} onChange={(e) => setEtablissement({ ...etablissement, email: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse postale / Localisation</label>
              <textarea rows={3} value={etablissement.adresse || ""} onChange={(e) => setEtablissement({ ...etablissement, adresse: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Ex: BP 123, Quartier administratif..." />
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center shadow-sm disabled:opacity-50 transition-colors">
                <Save size={20} className="mr-2" />
                {isSaving ? "Enregistrement..." : "Enregistrer les informations"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}