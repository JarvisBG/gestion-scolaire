import React, { useState, useEffect } from "react";
import api from "../api/axios"; // Assure-toi d'utiliser ton fichier axios avec l'intercepteur !
import { Users, Search, Plus, Edit, Eye, X, UserCircle, Download } from "lucide-react";

interface Employe {
  id?: number; photo?: string | null; nom: string; prenom: string; sexe: string; date_naissance: string;
  telephone: string; email: string; adresse: string; fonction: string; date_recrutement: string; statut: string; observations?: string | null;
}

export default function Personnel() {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [recherche, setRecherche] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  
  const [currentEmploye, setCurrentEmploye] = useState<Employe>({
    nom: "", prenom: "", sexe: "M", date_naissance: "", telephone: "",
    email: "", adresse: "", fonction: "Enseignant", date_recrutement: "", statut: "Actif", observations: ""
  });

  const fetchEmployes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/personnel/");
      setEmployes(response.data);
    } catch (error) { console.error("Erreur", error); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchEmployes(); }, []);

  const employesFiltres = employes.filter(emp => 
    `${emp.nom} ${emp.prenom} ${emp.fonction}`.toLowerCase().includes(recherche.toLowerCase())
  );

  const openModal = (mode: "create" | "edit" | "view", employe?: Employe) => {
    setModalMode(mode);
    if (employe) setCurrentEmploye(employe);
    else setCurrentEmploye({ nom: "", prenom: "", sexe: "M", date_naissance: "", telephone: "", email: "", adresse: "", fonction: "Enseignant", date_recrutement: "", statut: "Actif", observations: "" });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Nettoyage avant envoi
      const payload = { ...currentEmploye };
      if (payload.email === "") payload.email = "N/A"; // Pour éviter les soucis de DB si vide
      if (payload.observations === "") payload.observations = null;

      if (modalMode === "create") {
        await api.post("/personnel/", payload);
      } else if (modalMode === "edit" && payload.id) {
        await api.put(`/personnel/${payload.id}`, payload);
      }
      setIsModalOpen(false);
      fetchEmployes();
    } catch (error: any) {
      console.error("Erreur détaillée:", error);
      // ✨ LA LECTURE DU MESSAGE D'ERREUR DU BACKEND EST ICI ✨
      if (error.response && error.response.data && error.response.data.detail) {
        alert("⚠️ Erreur : " + error.response.data.detail);
      } else {
        alert("❌ Une erreur inattendue est survenue. Vérifiez vos données.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-600" />
            Gestion du Personnel
          </h2>
          <p className="text-sm text-gray-500 mt-1">Gérez les dossiers de vos employés et enseignants.</p>
        </div>
        <div className="flex space-x-3">
          {/* BOUTON PDF MAGIQUE */}
          <button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors">
            <Download className="w-4 h-4 mr-2" /> Exporter PDF
          </button>
          <button onClick={() => openModal("create")} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm font-medium">
            <Plus className="w-4 h-4 mr-2" /> Nouveau membre
          </button>
        </div>
      </div>

      {/* Titre visible uniquement à l'impression */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">Liste du Personnel - Année 2025/2026</h1>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3 print:hidden">
        <Search className="w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Rechercher par nom, prénom ou fonction..." className="flex-1 outline-none text-gray-700 bg-transparent" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? ( <div className="p-10 text-center text-gray-500">Chargement des données...</div> ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm font-medium">
                  <th className="p-4">Employé</th>
                  <th className="p-4">Fonction</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employesFiltres.length === 0 ? ( <tr><td colSpan={5} className="p-6 text-center text-gray-500">Aucun employé trouvé.</td></tr> ) : (
                  employesFiltres.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 flex items-center space-x-3">
                        <UserCircle className="w-10 h-10 text-gray-400" />
                        <div>
                          <p className="font-bold text-gray-800">{emp.nom} {emp.prenom}</p>
                          <p className="text-xs text-gray-500">{emp.sexe === 'M' ? 'Homme' : 'Femme'}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-800 font-medium">{emp.fonction}</td>
                      <td className="p-4 text-sm text-gray-600">
                        <p className="font-medium text-gray-800">{emp.telephone}</p>
                        <p className="text-xs text-gray-500">{emp.email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${emp.statut === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{emp.statut}</span>
                      </td>
                      <td className="p-4 flex justify-end space-x-2 print:hidden">
                        <button onClick={() => openModal("view", emp)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openModal("edit", emp)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-md"><Edit className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-gray-50 z-10">
              <h3 className="text-xl font-bold text-gray-800">{modalMode === "create" ? "Ajouter un employé" : modalMode === "edit" ? "Modifier l'employé" : "Fiche de l'employé"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6">
              {modalMode === "view" ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <UserCircle className="w-24 h-24 text-gray-300" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{currentEmploye.nom} {currentEmploye.prenom}</h2>
                      <p className="text-lg text-blue-600 font-medium">{currentEmploye.fonction}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 border-b pb-2 mb-3">Informations Personnelles</h4>
                      <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-800">Sexe:</span> {currentEmploye.sexe === "M" ? "Masculin" : "Féminin"}</p>
                      <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-800">Né(e) le:</span> {currentEmploye.date_naissance}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 border-b pb-2 mb-3">Contact</h4>
                      <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-800">Tél:</span> {currentEmploye.telephone}</p>
                      <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-800">Email:</span> {currentEmploye.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium">Nom *</label><input type="text" required value={currentEmploye.nom} onChange={e => setCurrentEmploye({...currentEmploye, nom: e.target.value})} className="mt-1 w-full border p-2 rounded-md" /></div>
                    <div><label className="block text-sm font-medium">Prénom *</label><input type="text" required value={currentEmploye.prenom} onChange={e => setCurrentEmploye({...currentEmploye, prenom: e.target.value})} className="mt-1 w-full border p-2 rounded-md" /></div>
                    <div><label className="block text-sm font-medium">Sexe *</label><select value={currentEmploye.sexe} onChange={e => setCurrentEmploye({...currentEmploye, sexe: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-white"><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
                    <div><label className="block text-sm font-medium">Date de naissance *</label><input type="date" required value={currentEmploye.date_naissance} onChange={e => setCurrentEmploye({...currentEmploye, date_naissance: e.target.value})} className="mt-1 w-full border p-2 rounded-md" /></div>
                    <div><label className="block text-sm font-medium">Téléphone *</label><input type="text" required value={currentEmploye.telephone} onChange={e => setCurrentEmploye({...currentEmploye, telephone: e.target.value})} className="mt-1 w-full border p-2 rounded-md" /></div>
                    <div><label className="block text-sm font-medium">Email (Unique)</label><input type="email" placeholder="Pour connexion future..." value={currentEmploye.email || ""} onChange={e => setCurrentEmploye({...currentEmploye, email: e.target.value})} className="mt-1 w-full border p-2 rounded-md" /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium">Adresse *</label><input type="text" required value={currentEmploye.adresse} onChange={e => setCurrentEmploye({...currentEmploye, adresse: e.target.value})} className="mt-1 w-full border p-2 rounded-md" /></div>
                    <div><label className="block text-sm font-medium">Fonction *</label><select value={currentEmploye.fonction} onChange={e => setCurrentEmploye({...currentEmploye, fonction: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-white"><option value="Enseignant">Enseignant</option><option value="Directeur">Directeur</option><option value="Secrétaire">Secrétaire</option><option value="Surveillant">Surveillant</option></select></div>
                    <div><label className="block text-sm font-medium">Date recrutement *</label><input type="date" required value={currentEmploye.date_recrutement} onChange={e => setCurrentEmploye({...currentEmploye, date_recrutement: e.target.value})} className="mt-1 w-full border p-2 rounded-md" /></div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Sauvegarder</button>
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