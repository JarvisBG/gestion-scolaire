import { useState, useEffect } from "react";
import api from "../api";
import { School, Plus, Edit, Eye, X, Users, BookOpen, User } from "lucide-react";

interface EmployeMinimal {
  id: number;
  nom: string;
  prenom: string;
}

interface ClasseData {
  id?: number;
  nom: string;
  niveau: string;
  salle: string;
  professeur_principal_id?: number | string | null; // string pour gérer le champ vide du formulaire
  professeur_principal?: EmployeMinimal;
}

export default function Classes() {
  const [classes, setClasses] = useState<ClasseData[]>([]);
  const [enseignants, setEnseignants] = useState<EmployeMinimal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gestion de la modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  
  const [currentClasse, setCurrentClasse] = useState<ClasseData>({
    nom: "", niveau: "Collège", salle: "", professeur_principal_id: ""
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // On récupère les classes
      const resClasses = await api.get("/classes/");
      setClasses(resClasses.data);

      // On récupère le personnel pour filtrer uniquement les Enseignants
      const resPersonnel = await api.get("/personnel/");
      // On suppose que le backend renvoie un champ 'fonction' pour le personnel
      const profs = resPersonnel.data.filter((emp: any) => emp.fonction === "Enseignant");
      setEnseignants(profs);
    } catch (error) {
      console.error("Erreur de récupération des données", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (mode: "create" | "edit" | "view", classe?: ClasseData) => {
    setModalMode(mode);
    if (classe) {
      // Si le prof principal existe, on prend son ID pour le select, sinon vide
      setCurrentClasse({
        ...classe,
        professeur_principal_id: classe.professeur_principal?.id || ""
      });
    } else {
      setCurrentClasse({ nom: "", niveau: "Collège", salle: "", professeur_principal_id: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // On convertit l'ID du prof en nombre ou en null pour la base de données
    const dataToSend = {
      ...currentClasse,
      professeur_principal_id: currentClasse.professeur_principal_id ? Number(currentClasse.professeur_principal_id) : null
    };

    try {
      if (modalMode === "create") {
        await api.post("/classes/", dataToSend);
        alert("Classe ajoutée avec succès !");
      } else if (modalMode === "edit" && currentClasse.id) {
        await api.put(`/classes/${currentClasse.id}`, dataToSend);
        alert("Classe modifiée avec succès !");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Erreur de sauvegarde", error);
      alert("Erreur lors de l'enregistrement de la classe.");
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <School className="w-6 h-6 mr-2 text-green-600" />
            Gestion des Classes
          </h2>
          <p className="text-sm text-gray-500">Gérez les salles, les niveaux et affectez les professeurs principaux.</p>
        </div>
        <button 
          onClick={() => openModal("create")}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Classe
        </button>
      </div>

      {/* Grille des Classes */}
      {isLoading ? (
        <div className="text-center text-gray-500 py-10">Chargement des classes...</div>
      ) : classes.length === 0 ? (
        <div className="bg-white p-10 rounded-xl border border-gray-200 text-center text-gray-500">
          Aucune classe enregistrée pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              
              {/* Entête de la carte */}
              <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-green-800">{cls.nom}</h3>
                  <span className="text-xs font-medium text-green-600 bg-white px-2 py-1 rounded border border-green-200 mt-1 inline-block">
                    {cls.niveau}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => openModal("view", cls)} className="p-1.5 text-blue-600 bg-white rounded-md hover:bg-blue-50" title="Détails"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => openModal("edit", cls)} className="p-1.5 text-orange-600 bg-white rounded-md hover:bg-orange-50" title="Modifier"><Edit className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Corps de la carte */}
              <div className="p-4 flex-1 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <School className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-700 mr-1">Salle:</span> {cls.salle}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-700 mr-1">Prof. Principal:</span> 
                  {cls.professeur_principal ? `${cls.professeur_principal.nom} ${cls.professeur_principal.prenom}` : <span className="text-gray-400 italic">Non assigné</span>}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-700 mr-1">Effectif:</span> 
                  <span className="text-gray-400 italic">0 élèves (À venir)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALE (Ajout / Modification / Vue Détaillée) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <School className="w-6 h-6 mr-2 text-green-600" />
                {modalMode === "create" ? "Créer une nouvelle classe" : modalMode === "edit" ? "Modifier la classe" : `Détails de la classe ${currentClasse.nom}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {modalMode === "view" ? (
                // --- VUE DÉTAILLÉE ---
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Niveau d'étude</p>
                      <p className="text-lg font-bold text-gray-800">{currentClasse.niveau}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Salle attribuée</p>
                      <p className="text-lg font-bold text-gray-800">{currentClasse.salle}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center">
                    <User className="w-10 h-10 text-blue-500 mr-4" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Professeur Principal</p>
                      <p className="text-lg font-bold text-blue-900">
                        {currentClasse.professeur_principal ? `${currentClasse.professeur_principal.nom} ${currentClasse.professeur_principal.prenom}` : "Aucun enseignant assigné"}
                      </p>
                    </div>
                  </div>

                  {/* Zones d'attente pour la suite du projet */}
                  <div className="mt-8 border-t pt-6 space-y-4">
                    <h4 className="font-bold text-gray-800 mb-2">Modules liés à cette classe :</h4>
                    <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg opacity-70">
                      <div className="flex items-center"><Users className="w-5 h-5 mr-3 text-gray-500" /> Liste des élèves</div>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">Module en développement</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg opacity-70">
                      <div className="flex items-center"><BookOpen className="w-5 h-5 mr-3 text-gray-500" /> Matières enseignées</div>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">Module en développement</span>
                    </div>
                  </div>
                </div>
              ) : (
                // --- FORMULAIRE (Création/Édition) ---
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom de la classe *</label>
                      <input type="text" required placeholder="Ex: 6ème A" value={currentClasse.nom} onChange={e => setCurrentClasse({...currentClasse, nom: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Niveau *</label>
                      <select required value={currentClasse.niveau} onChange={e => setCurrentClasse({...currentClasse, niveau: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white">
                        <option value="Maternelle">Maternelle</option>
                        <option value="Primaire">Primaire</option>
                        <option value="Collège">Collège</option>
                        <option value="Lycée">Lycée</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Salle de classe *</label>
                      <input type="text" required placeholder="Ex: Salle 12 ou B1" value={currentClasse.salle} onChange={e => setCurrentClasse({...currentClasse, salle: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Professeur Principal (Optionnel)</label>
                      <select value={currentClasse.professeur_principal_id || ""} onChange={e => setCurrentClasse({...currentClasse, professeur_principal_id: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white">
                        <option value="">-- Aucun enseignant assigné --</option>
                        {enseignants.map(prof => (
                          <option key={prof.id} value={prof.id}>{prof.nom} {prof.prenom}</option>
                        ))}
                      </select>
                      {enseignants.length === 0 && (
                        <p className="text-xs text-orange-500 mt-1">Aucun enseignant trouvé dans le système.</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                      Annuler
                    </button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                      {modalMode === "create" ? "Créer la classe" : "Enregistrer les modifications"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}