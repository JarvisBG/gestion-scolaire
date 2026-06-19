import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { BookOpen, Plus, Trash2 } from "lucide-react";

interface Matiere {
  id: int;
  nom: string;
  couleur: string;
}

export default function Matieres() {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [nouvelleMatiere, setNouvelleMatiere] = useState({ nom: "", couleur: "#3B82F6" });

  useEffect(() => {
    fetchMatieres();
  }, []);

  const fetchMatieres = async () => {
    try {
      const res = await api.get("/matieres/");
      setMatieres(res.data);
    } catch (error) {
      console.error("Erreur chargement matières", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouvelleMatiere.nom) return;
    try {
      await api.post("/matieres/", nouvelleMatiere);
      setNouvelleMatiere({ nom: "", couleur: "#3B82F6" });
      fetchMatieres();
    } catch (error) {
      console.error("Erreur création", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer cette matière ?")) return;
    try {
      await api.delete(`/matieres/${id}`);
      fetchMatieres();
    } catch (error) {
      console.error("Erreur suppression", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <BookOpen className="mr-3 text-blue-600" size={32} />
            Gestion des Matières
          </h1>
          <p className="text-gray-500 mt-1">Configurez les disciplines enseignées et leurs couleurs pour le calendrier.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulaire d'ajout */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Plus size={18} className="mr-2 text-green-600"/> Nouvelle Matière
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la matière *</label>
              <input type="text" required placeholder="Ex: Mathématiques" value={nouvelleMatiere.nom} onChange={e => setNouvelleMatiere({...nouvelleMatiere, nom: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couleur sur le calendrier</label>
              <div className="flex items-center gap-3">
                <input type="color" value={nouvelleMatiere.couleur} onChange={e => setNouvelleMatiere({...nouvelleMatiere, couleur: e.target.value})} className="h-10 w-14 rounded cursor-pointer border-0 p-0" />
                <span className="text-sm text-gray-500 font-mono">{nouvelleMatiere.couleur}</span>
              </div>
            </div>
            <button type="submit" className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Ajouter
            </button>
          </form>
        </div>

        {/* Liste des matières */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Liste des disciplines ({matieres.length})</h3>
          {matieres.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucune matière configurée.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {matieres.map(matiere => (
                <div key={matiere.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-3 shadow-sm" style={{ backgroundColor: matiere.couleur }}></div>
                    <span className="font-medium text-gray-800">{matiere.nom}</span>
                  </div>
                  <button onClick={() => handleDelete(matiere.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}