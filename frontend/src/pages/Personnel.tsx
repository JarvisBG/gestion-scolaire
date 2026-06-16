import { useState, useEffect } from "react";
import api from "../api";
import { Users, Search, Plus, Edit, Eye, X, UserCircle } from "lucide-react";

// Définition de la structure d'un employé
interface Employe {
  id?: number;
  photo?: string | null;
  nom: string;
  prenom: string;
  sexe: string;
  date_naissance: string;
  telephone: string;
  email: string;
  adresse: string;
  fonction: string;
  date_recrutement: string;
  statut: string;
  observations?: string | null;
}

export default function Personnel() {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [recherche, setRecherche] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Gestion de la fenêtre modale (Ajout, Modification, Vue détaillée)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  
  // L'employé en cours d'édition ou de visualisation (ou vide pour la création)
  const [currentEmploye, setCurrentEmploye] = useState<Employe>({
    nom: "", prenom: "", sexe: "M", date_naissance: "", telephone: "",
    email: "", adresse: "", fonction: "Enseignant", date_recrutement: "", statut: "Actif", observations: ""
  });

  // Charger les employés au démarrage
  const fetchEmployes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/personnel/");
      setEmployes(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération du personnel", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployes();
  }, []);

  // Filtrer les employés avec la barre de recherche
  const employesFiltres = employes.filter(emp => 
    `${emp.nom} ${emp.prenom} ${emp.fonction}`.toLowerCase().includes(recherche.toLowerCase())
  );

  // Ouvrir la modale selon le mode
  const openModal = (mode: "create" | "edit" | "view", employe?: Employe) => {
    setModalMode(mode);
    if (employe) {
      setCurrentEmploye(employe);
    } else {
      // Réinitialiser le formulaire pour une création
      setCurrentEmploye({
        nom: "", prenom: "", sexe: "M", date_naissance: "", telephone: "",
        email: "", adresse: "", fonction: "Enseignant", date_recrutement: "", statut: "Actif", observations: ""
      });
    }
    setIsModalOpen(true);
  };

  // Sauvegarder (Création ou Modification)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await api.post("/personnel/", currentEmploye);
        alert("Employé ajouté avec succès !");
      } else if (modalMode === "edit" && currentEmploye.id) {
        await api.put(`/personnel/${currentEmploye.id}`, currentEmploye);
        alert("Employé modifié avec succès !");
      }
      setIsModalOpen(false);
      fetchEmployes(); // Recharger la liste
    } catch (error) {
      console.error("Erreur lors de la sauvegarde", error);
      alert("Une erreur est survenue lors de l'enregistrement.");
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête et Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            Gestion du Personnel
          </h2>
          <p className="text-sm text-gray-500">Gérez les dossiers de vos employés et enseignants.</p>
        </div>
        <button 
          onClick={() => openModal("create")}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un employé
        </button>
      </div>

      {/* Barre de Recherche */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Rechercher par nom, prénom ou fonction..." 
          className="flex-1 outline-none text-gray-700 bg-transparent"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
      </div>

      {/* Tableau du personnel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">Chargement des données...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm font-medium">
                  <th className="p-4">Employé</th>
                  <th className="p-4">Fonction</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employesFiltres.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-500">Aucun employé trouvé.</td></tr>
                ) : (
                  employesFiltres.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 flex items-center space-x-3">
                        {emp.photo ? (
                          <img src={emp.photo} alt="Profil" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <UserCircle className="w-10 h-10 text-gray-400" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{emp.nom} {emp.prenom}</p>
                          <p className="text-xs text-gray-500">{emp.sexe === 'M' ? 'Homme' : 'Femme'}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-700 font-medium">{emp.fonction}</td>
                      <td className="p-4 text-sm text-gray-600">
                        <p>{emp.telephone}</p>
                        <p className="text-xs text-gray-400">{emp.email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${emp.statut === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {emp.statut}
                        </span>
                      </td>
                      <td className="p-4 flex justify-end space-x-2">
                        <button onClick={() => openModal("view", emp)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md" title="Voir les détails">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openModal("edit", emp)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-md" title="Modifier">
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FENÊTRE MODALE (Ajout / Modification / Vue) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            
            {/* Header Modale */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">
                {modalMode === "create" ? "Ajouter un employé" : modalMode === "edit" ? "Modifier l'employé" : "Fiche de l'employé"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Corps Modale */}
            <div className="p-6">
              {modalMode === "view" ? (
                // VUE DÉTAILLÉE (Lecture Seule)
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <UserCircle className="w-24 h-24 text-gray-300" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{currentEmploye.nom} {currentEmploye.prenom}</h2>
                      <p className="text-lg text-blue-600 font-medium">{currentEmploye.fonction}</p>
                      <span className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${currentEmploye.statut === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {currentEmploye.statut}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 border-b pb-2 mb-3">Informations Personnelles</h4>
                      <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-800">Sexe:</span> {currentEmploye.sexe}</p>
                      <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-800">Né(e) le:</span> {currentEmploye.date_naissance}</p>
                      <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-800">Recruté(e) le:</span> {currentEmploye.date_recrutement}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 border-b pb-2 mb-3">Contact</h4>
                      <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-800">Tél:</span> {currentEmploye.telephone}</p>
                      <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-800">Email:</span> {currentEmploye.email || 'N/A'}</p>
                      <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-800">Adresse:</span> {currentEmploye.adresse}</p>
                    </div>
                  </div>

                  {currentEmploye.observations && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 border-b border-yellow-200 pb-2 mb-2">Observations</h4>
                      <p className="text-sm text-yellow-900">{currentEmploye.observations}</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t">
                     {/* Bouton pour créer un compte utilisateur (sera codé plus tard) */}
                     <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 shadow-sm text-sm font-medium">
                        Générer un compte de connexion
                     </button>
                  </div>
                </div>
              ) : (
                // FORMULAIRE (Création ou Modification)
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom *</label>
                      <input type="text" required value={currentEmploye.nom} onChange={e => setCurrentEmploye({...currentEmploye, nom: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prénom *</label>
                      <input type="text" required value={currentEmploye.prenom} onChange={e => setCurrentEmploye({...currentEmploye, prenom: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sexe *</label>
                      <select value={currentEmploye.sexe} onChange={e => setCurrentEmploye({...currentEmploye, sexe: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white">
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date de naissance *</label>
                      <input type="date" required value={currentEmploye.date_naissance} onChange={e => setCurrentEmploye({...currentEmploye, date_naissance: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Téléphone *</label>
                      <input type="text" required value={currentEmploye.telephone} onChange={e => setCurrentEmploye({...currentEmploye, telephone: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input type="email" value={currentEmploye.email || ""} onChange={e => setCurrentEmploye({...currentEmploye, email: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Adresse complète *</label>
                      <input type="text" required value={currentEmploye.adresse} onChange={e => setCurrentEmploye({...currentEmploye, adresse: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fonction *</label>
                      <select value={currentEmploye.fonction} onChange={e => setCurrentEmploye({...currentEmploye, fonction: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white">
                        <option value="Enseignant">Enseignant</option>
                        <option value="Directeur">Directeur</option>
                        <option value="Secrétaire">Secrétaire</option>
                        <option value="Surveillant">Surveillant</option>
                        <option value="Comptable">Comptable</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date de recrutement *</label>
                      <input type="date" required value={currentEmploye.date_recrutement} onChange={e => setCurrentEmploye({...currentEmploye, date_recrutement: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Statut</label>
                      <select value={currentEmploye.statut} onChange={e => setCurrentEmploye({...currentEmploye, statut: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white">
                        <option value="Actif">Actif</option>
                        <option value="Inactif">Inactif / Ancien employé</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Observations (Optionnel)</label>
                      <textarea rows={3} value={currentEmploye.observations || ""} onChange={e => setCurrentEmploye({...currentEmploye, observations: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"></textarea>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 mt-6 border-t">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                      Annuler
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      {modalMode === "create" ? "Enregistrer l'employé" : "Enregistrer les modifications"}
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