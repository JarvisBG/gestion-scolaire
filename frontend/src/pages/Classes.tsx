import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Edit, Plus, Users, User, DoorOpen, Trash2, School, X, Download } from "lucide-react";

interface Classe { id: number; nom: string; niveau: string; salle?: string; prof_principal?: string; }
// ✨ On ajoute le sexe dans l'interface Eleve pour pouvoir faire nos calculs
interface Eleve { id: number; classe_id: number; sexe?: string; }
interface Personnel { id: number; nom: string; prenom: string; fonction: string; }

export default function Classes() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [enseignants, setEnseignants] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);

  // Gestion Modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClasse, setEditingClasse] = useState<Partial<Classe> | null>(null);

  // --- 🛡️ GESTION DES PERMISSIONS ---
  const userRole = localStorage.getItem("role") || "Enseignant";
  const canEdit = userRole === "Directeur" || userRole === "Secrétaire";
  const canDelete = userRole === "Directeur";

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const classesRes = await api.get("/classes/");
      setClasses(classesRes.data);

      const elevesRes = await api.get("/eleves/");
      setEleves(elevesRes.data);

      try {
        const personnelRes = await api.get("/personnel/");
        setEnseignants(personnelRes.data.filter((p: Personnel) => p.fonction === "Enseignant"));
      } catch (personnelError) {
        console.warn("Impossible de charger le personnel.");
        setEnseignants([]);
      }
      
    } catch (error) { 
      console.error("Erreur générale lors de la récupération des données", error); 
    } finally { 
      setLoading(false); 
    }
  };

  const openModal = (classe: Classe | null = null) => {
    if (!canEdit) return; // Sécurité supplémentaire
    setEditingClasse(classe || { nom: "", niveau: "Primaire", salle: "", prof_principal: "" });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return; // Sécurité

    try {
      if (editingClasse?.id) {
        await api.put(`/classes/${editingClasse.id}`, editingClasse);
      } else {
        await api.post("/classes/", editingClasse);
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error) { 
      console.error("Erreur de sauvegarde", error);
      alert("Erreur lors de la sauvegarde."); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDelete) return; // Sécurité
    if (window.confirm("Attention : Supprimer cette classe est définitif. Continuer ?")) {
      try {
        await api.delete(`/classes/${id}`);
        fetchData();
      } catch (error: any) { 
        const errorMsg = error.response?.data?.detail || "Impossible de supprimer la classe.";
        alert(errorMsg); 
      }
    }
  };

  // ✨ LA NOUVELLE FONCTION QUI CALCULE TOUT PAR CLASSE ✨
  const getStatsClasse = (classeId: number) => {
    const elevesDeLaClasse = eleves.filter(e => e.classe_id === classeId);
    
    const garcons = elevesDeLaClasse.filter(e => {
      const s = (e.sexe || "").toString().trim().toUpperCase();
      return s === "M" || s === "MASCULIN";
    }).length;

    const filles = elevesDeLaClasse.filter(e => {
      const s = (e.sexe || "").toString().trim().toUpperCase();
      return s === "F" || s === "FÉMININ" || s === "FEMININ";
    }).length;

    return {
      total: elevesDeLaClasse.length,
      garcons,
      filles
    };
  };

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
          {/* L'enseignant ne peut pas créer de nouvelle classe */}
          {canEdit && (
            <button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center shadow font-medium">
              <Plus size={20} className="mr-2" /> Nouvelle Classe
            </button>
          )}
        </div>
      </div>

      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">Liste des Classes - Année 2025/2026</h1>
      </div>

      {loading ? ( <div className="p-8 text-center text-gray-500">Chargement...</div> ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classe) => {
            // On récupère les statistiques détaillées pour cette classe précise
            const stats = getStatsClasse(classe.id);
            
            return (
              <div key={classe.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-green-800">{classe.nom}</h2>
                    <span className="inline-block mt-1 px-2 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded border border-green-100">{classe.niveau}</span>
                  </div>
                  
                  {/* Actions restreintes par rôle */}
                  <div className="flex gap-2 print:hidden">
                    {canEdit && (
                      <button onClick={() => openModal(classe)} className="text-orange-500 hover:bg-orange-50 p-1.5 rounded" title="Modifier">
                        <Edit size={18} />
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => handleDelete(classe.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded" title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600 mt-6 border-t border-gray-50 pt-4">
                  <p className="flex items-center"><DoorOpen size={16} className="mr-2 text-gray-400" /> <strong>Salle:</strong> <span className="ml-1">{classe.salle || "-"}</span></p>
                  <p className="flex items-center"><User size={16} className="mr-2 text-gray-400" /> <strong>Prof. Principal:</strong> <span className="ml-1 text-gray-800 font-medium">{classe.prof_principal || "Non assigné"}</span></p>
                  
                  {/* ✨ AFFICHAGE DE L'EFFECTIF AVEC LES DÉTAILS ✨ */}
                  <div className="flex items-start mt-2">
                    <Users size={16} className="mr-2 mt-0.5 text-gray-400" /> 
                    <div className="flex flex-col">
                      <span>
                        <strong>Effectif:</strong> 
                        <span className={`ml-1 font-bold ${stats.total > 0 ? "text-blue-600" : "text-gray-400"}`}>
                          {stats.total} élève(s)
                        </span>
                      </span>
                      {stats.total > 0 && (
                        <span className="text-xs text-gray-500 mt-0.5">
                          {stats.garcons} Garçon(s) • {stats.filles} Fille(s)
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale d'édition (Cachée pour l'enseignant de toute façon, mais on la laisse dans le code pour les autres) */}
      {isModalOpen && canEdit && (
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