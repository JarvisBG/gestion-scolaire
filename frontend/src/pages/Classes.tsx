import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Edit, Plus, Users, User, DoorOpen, Trash2, School, X, Download } from "lucide-react";

interface Classe { id: number; nom: string; niveau: string; salle?: string; prof_principal?: string; }
interface Eleve { id: number; classe_id: number; }
interface Personnel { id: number; nom: string; prenom: string; fonction: string; }

export default function Classes() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [enseignants, setEnseignants] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);

  // Gestion Modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClasse, setEditingClasse] = useState<Partial<Classe> | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classesRes, elevesRes, personnelRes] = await Promise.all([
        api.get("/classes/"), api.get("/eleves/"), api.get("/personnel/").catch(() => ({ data: [] }))
      ]);
      setClasses(classesRes.data);
      setEleves(elevesRes.data);
      // On ne garde que les enseignants pour le choix du prof principal
      setEnseignants(personnelRes.data.filter((p: Personnel) => p.fonction === "Enseignant"));
    } catch (error) { console.error("Erreur", error); } 
    finally { setLoading(false); }
  };

  const openModal = (classe: Classe | null = null) => {
    setEditingClasse(classe || { nom: "", niveau: "Primaire", salle: "", prof_principal: "" });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClasse?.id) await api.put(`/classes/${editingClasse.id}`, editingClasse);
      else await api.post("/classes/", editingClasse);
      fetchData();
      setIsModalOpen(false);
    } catch (error) { alert("Erreur lors de la sauvegarde."); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Attention : Supprimer cette classe est définitif. Continuer ?")) {
      try {
        await api.delete(`/classes/${id}`);
        fetchData();
      } catch (error) { alert("Impossible de supprimer. Vérifiez s'il y a encore des élèves dedans."); }
    }
  };

  const getEffectif = (classeId: number) => eleves.filter(e => e.classe_id === classeId).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <School className="mr-3 text-green-600" size={32} />
            Gestion des Classes
          </h1>
          <p className="text-gray-500 mt-1">Gérez les salles, les niveaux et affectez les professeurs principaux.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => window.print()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center font-medium transition-colors">
            <Download size={20} className="mr-2" /> Exporter PDF
          </button>
          <button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center shadow font-medium">
            <Plus size={20} className="mr-2" /> Nouvelle Classe
          </button>
        </div>
      </div>

      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">Liste des Classes - Année 2025/2026</h1>
      </div>

      {loading ? ( <div className="p-8 text-center text-gray-500">Chargement...</div> ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classe) => {
            const effectif = getEffectif(classe.id);
            return (
              <div key={classe.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-green-800">{classe.nom}</h2>
                    <span className="inline-block mt-1 px-2 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded border border-green-100">{classe.niveau}</span>
                  </div>
                  <div className="flex gap-2 print:hidden">
                    <button onClick={() => openModal(classe)} className="text-orange-500 hover:bg-orange-50 p-1.5 rounded"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(classe.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-gray-600 mt-6 border-t border-gray-50 pt-4">
                  <p className="flex items-center"><DoorOpen size={16} className="mr-2 text-gray-400" /> <strong>Salle:</strong> <span className="ml-1">{classe.salle || "-"}</span></p>
                  <p className="flex items-center"><User size={16} className="mr-2 text-gray-400" /> <strong>Prof. Principal:</strong> <span className="ml-1 text-gray-800 font-medium">{classe.prof_principal || "Non assigné"}</span></p>
                  <p className="flex items-center"><Users size={16} className="mr-2 text-gray-400" /> <strong>Effectif:</strong> <span className={`ml-1 font-bold ${effectif > 0 ? "text-blue-600" : "text-gray-400"}`}>{effectif} élève(s)</span></p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale d'édition */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">{editingClasse?.id ? "Modifier la classe" : "Nouvelle Classe"}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-gray-600 w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom de la classe (ex: CM2 A) *</label>
                <input type="text" required value={editingClasse?.nom || ""} onChange={e => setEditingClasse({...editingClasse, nom: e.target.value})} className="mt-1 w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Niveau *</label>
                <select value={editingClasse?.niveau || "Primaire"} onChange={e => setEditingClasse({...editingClasse, niveau: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-white">
                  <option value="Maternelle">Maternelle</option>
                  <option value="Primaire">Primaire</option>
                  <option value="Collège">Collège</option>
                  <option value="Lycée">Lycée</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Salle physique</label>
                <input type="text" placeholder="ex: Salle B4" value={editingClasse?.salle || ""} onChange={e => setEditingClasse({...editingClasse, salle: e.target.value})} className="mt-1 w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Professeur Principal</label>
                <select value={editingClasse?.prof_principal || ""} onChange={e => setEditingClasse({...editingClasse, prof_principal: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-white">
                  <option value="">-- Aucun --</option>
                  {enseignants.map(ens => (
                    <option key={ens.id} value={`${ens.nom} ${ens.prenom}`}>{ens.nom} {ens.prenom}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}