import React, { useState, useEffect } from "react";
import api from "../api/axios"; 
import { Users, Search, Plus, Edit, Eye, Trash2, Key, CheckCircle, ShieldAlert, Power, XCircle } from "lucide-react";

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
  utilisateur_id?: number | null;
}

export default function Personnel() {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [recherche, setRecherche] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  
  const [currentEmploye, setCurrentEmploye] = useState<Employe>({
    nom: "", prenom: "", sexe: "M", date_naissance: "", telephone: "",
    email: "", adresse: "", fonction: "Enseignant", date_recrutement: "", statut: "Actif", observations: ""
  });

  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchEmployes();
  }, []);

  const fetchEmployes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/personnel/");
      setEmployes(response.data);
    } catch (error) {
      console.error("Erreur de chargement du personnel", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await api.post("/personnel/", currentEmploye);
        alert("✅ Employé ajouté avec succès !");
      } else if (modalMode === "edit") {
        await api.put(`/personnel/${currentEmploye.id}`, currentEmploye);
        alert("✅ Modifications enregistrées !");
      }
      setIsModalOpen(false);
      fetchEmployes();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde", error);
      alert("❌ Une erreur est survenue.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cet employé ? Il est souvent préférable de simplement le suspendre.")) return;
    try {
      await api.delete(`/personnel/${id}`);
      fetchEmployes();
    } catch (error) {
      console.error("Erreur de suppression", error);
    }
  };

  // --- 💡 NOUVEAU : DÉSACTIVER UN COMPTE SANS LE SUPPRIMER ---
  const handleToggleStatus = async (emp: Employe) => {
    const actionText = emp.statut === "Actif" ? "suspendre" : "réactiver";
    
    if (window.confirm(`Voulez-vous vraiment ${actionText} le compte de ${emp.prenom} ${emp.nom} ?`)) {
      try {
        const nouveauStatut = emp.statut === "Actif" ? "Suspendu" : "Actif";
        
        // On met à jour le statut de l'employé
        await api.put(`/personnel/${emp.id}`, { ...emp, statut: nouveauStatut });
        
        // Si le backend nécessite aussi de couper l'utilisateur lié :
        if (emp.utilisateur_id) {
            await api.put(`/utilisateurs/${emp.utilisateur_id}`, { est_actif: nouveauStatut === "Actif" }).catch(() => console.log("Mise à jour utilisateur non requise ou gérée par le backend"));
        }

        fetchEmployes();
      } catch (error) {
        console.error("Erreur lors de la modification du statut", error);
        alert("❌ Impossible de modifier le statut.");
      }
    }
  };

  // --- CRÉATION DU COMPTE UTILISATEUR ---
  const handleCreateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmploye.email || !password) {
      alert("L'email et le mot de passe sont obligatoires.");
      return;
    }

    try {
      // 1. On crée l'utilisateur dans le système de sécurité
      const userPayload = {
        email: currentEmploye.email,
        nom: currentEmploye.nom,
        prenom: currentEmploye.prenom,
        mot_de_passe: password,
        role: currentEmploye.fonction // Le rôle correspond à sa fonction
      };
      
      const userRes = await api.post("/utilisateurs/", userPayload);
      
      // 2. On lie ce nouvel utilisateur à la fiche employé
      await api.put(`/personnel/${currentEmploye.id}`, {
        ...currentEmploye,
        utilisateur_id: userRes.data.id
      });

      // 💡 L'ASTUCE EST ICI : Afficher les identifiants en clair à la création
      alert(`✅ COMPTE CRÉÉ AVEC SUCCÈS !\n\nVoici les identifiants à transmettre à ${currentEmploye.prenom} :\n📧 Email : ${currentEmploye.email}\n🔑 Mot de passe : ${password}\n\n(⚠️ Notez ce mot de passe, il ne sera plus jamais visible pour des raisons de sécurité !)`);
      
      setIsAccessModalOpen(false);
      setPassword("");
      fetchEmployes();
    } catch (error: any) {
      console.error("Erreur lors de la création de l'accès", error);
      alert("❌ Erreur : " + (error.response?.data?.detail || "Impossible de créer le compte. L'email est peut-être déjà utilisé."));
    }
  };

  // Les fonctions autorisées à avoir un accès numérique
  const fonctionsElegibles = ["Directeur", "Secrétaire", "Enseignant"];

  const employesFiltres = employes.filter(emp => 
    emp.nom.toLowerCase().includes(recherche.toLowerCase()) || 
    emp.prenom.toLowerCase().includes(recherche.toLowerCase()) ||
    emp.fonction.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 md:px-0">
      
      {/* EN-TÊTE RESPONSIVE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
            <Users className="mr-3 text-blue-600" size={32} />
            Gestion du Personnel
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Gérez vos employés et leurs accès à l'application.</p>
        </div>
        <button 
          onClick={() => {
            setModalMode("create");
            setCurrentEmploye({ nom: "", prenom: "", sexe: "M", date_naissance: "", telephone: "", email: "", adresse: "", fonction: "Enseignant", date_recrutement: "", statut: "Actif", observations: "" });
            setIsModalOpen(true);
          }} 
          className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition"
        >
          <Plus size={20} className="mr-2" /> Ajouter un employé
        </button>
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <Search className="text-gray-400 mr-3" size={20} />
        <input 
          type="text" 
          placeholder="Rechercher par nom, prénom ou fonction..." 
          className="w-full outline-none text-gray-700"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
      </div>

      {/* TABLEAU RESPONSIVE (SCROLL HORIZONTAL SUR MOBILE) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                <th className="p-4 font-medium">Nom & Prénom</th>
                <th className="p-4 font-medium">Fonction</th>
                <th className="p-4 font-medium">Téléphone</th>
                <th className="p-4 font-medium text-center">Accès Logiciel</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Chargement...</td></tr>
              ) : employesFiltres.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Aucun employé trouvé.</td></tr>
              ) : (
                employesFiltres.map((emp) => (
                  // Ligne rouge pâle si l'employé est suspendu
                  <tr key={emp.id} className={`border-b transition ${emp.statut === 'Suspendu' ? 'bg-red-50/40' : 'hover:bg-gray-50'}`}>
                    <td className="p-4 font-bold text-gray-800">{emp.nom} {emp.prenom}</td>
                    <td className="p-4 text-gray-600">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${emp.fonction === 'Directeur' ? 'bg-purple-100 text-purple-700' : emp.fonction === 'Secrétaire' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                        {emp.fonction}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{emp.telephone}</td>
                    
                    {/* GESTION DES ACCÈS ET STATUT */}
                    <td className="p-4 text-center">
                      {emp.statut === "Suspendu" ? (
                         <span className="inline-flex items-center text-red-600 text-sm font-bold bg-red-50 px-3 py-1 rounded-full border border-red-200">
                           <XCircle size={14} className="mr-1" /> Suspendu
                         </span>
                      ) : emp.utilisateur_id ? (
                         <span className="inline-flex items-center text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full border border-green-200">
                           <CheckCircle size={14} className="mr-1" /> Compte Actif
                         </span>
                      ) : fonctionsElegibles.includes(emp.fonction) ? (
                         <button 
                            onClick={() => { setCurrentEmploye(emp); setIsAccessModalOpen(true); }}
                            className="inline-flex items-center text-blue-600 text-sm font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-100 transition"
                          >
                           <Key size={14} className="mr-1" /> Créer un accès
                         </button>
                      ) : (
                         <span className="text-gray-400 text-xs flex items-center justify-center">
                           <ShieldAlert size={14} className="mr-1" /> Non autorisé
                         </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4 flex justify-end space-x-2">
                      <button onClick={() => { setCurrentEmploye(emp); setModalMode("view"); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg" title="Voir la fiche"><Eye size={18} /></button>
                      
                      {/* BOUTON POWER (Désactiver / Activer) */}
                      <button 
                        onClick={() => handleToggleStatus(emp)} 
                        className={`p-2 rounded-lg transition-colors bg-gray-50 ${emp.statut === 'Actif' ? 'text-orange-500 hover:bg-orange-100' : 'text-green-600 hover:bg-green-100'}`} 
                        title={emp.statut === 'Actif' ? "Suspendre l'employé" : "Réactiver l'employé"}
                      >
                        <Power size={18} />
                      </button>

                      <button onClick={() => { setCurrentEmploye(emp); setModalMode("edit"); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-yellow-600 bg-gray-50 hover:bg-yellow-50 rounded-lg" title="Modifier"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(emp.id!)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg" title="Supprimer"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALE : AJOUT / MODIFICATION EMPLOYÉ --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {modalMode === "create" ? "Nouvel Employé" : modalMode === "edit" ? "Modifier Employé" : "Fiche Employé"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500 font-bold text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Nom *</label><input type="text" required disabled={modalMode === "view"} value={currentEmploye.nom} onChange={e => setCurrentEmploye({...currentEmploye, nom: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-gray-50" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Prénom *</label><input type="text" required disabled={modalMode === "view"} value={currentEmploye.prenom} onChange={e => setCurrentEmploye({...currentEmploye, prenom: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-gray-50" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Sexe *</label><select disabled={modalMode === "view"} value={currentEmploye.sexe} onChange={e => setCurrentEmploye({...currentEmploye, sexe: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-gray-50"><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700">Date naissance *</label><input type="date" required disabled={modalMode === "view"} value={currentEmploye.date_naissance} onChange={e => setCurrentEmploye({...currentEmploye, date_naissance: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-gray-50" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Téléphone *</label><input type="text" required disabled={modalMode === "view"} value={currentEmploye.telephone} onChange={e => setCurrentEmploye({...currentEmploye, telephone: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-gray-50" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Email (Recommandé)</label><input type="email" disabled={modalMode === "view"} value={currentEmploye.email} onChange={e => setCurrentEmploye({...currentEmploye, email: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-gray-50" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Adresse *</label><input type="text" required disabled={modalMode === "view"} value={currentEmploye.adresse} onChange={e => setCurrentEmploye({...currentEmploye, adresse: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-gray-50" /></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fonction *</label>
                  <select required disabled={modalMode === "view"} value={currentEmploye.fonction} onChange={e => setCurrentEmploye({...currentEmploye, fonction: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-gray-50">
                    <option value="Enseignant">Enseignant</option>
                    <option value="Directeur">Directeur</option>
                    <option value="Secrétaire">Secrétaire</option>
                    <option value="Surveillant">Surveillant</option>
                    <option value="Agent Entretien">Agent d'entretien</option>
                    <option value="Vigile">Vigile</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700">Date recrutement *</label><input type="date" required disabled={modalMode === "view"} value={currentEmploye.date_recrutement} onChange={e => setCurrentEmploye({...currentEmploye, date_recrutement: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-gray-50" /></div>
              </div>

              {modalMode !== "view" && (
                <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50 w-full md:w-auto">Annuler</button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 w-full md:w-auto">Sauvegarder</button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* --- MODALE : CRÉER UN ACCÈS LOGICIEL --- */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
             <div className="p-5 border-b bg-blue-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-blue-800 flex items-center">
                <Key className="mr-2" size={20}/> Générer un accès logiciel
              </h2>
              <button onClick={() => setIsAccessModalOpen(false)} className="text-blue-500 hover:text-blue-700 font-bold text-xl">✕</button>
            </div>
            <form onSubmit={handleCreateAccess} className="p-6 space-y-4">
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-yellow-800 mb-4">
                Vous êtes sur le point de créer un accès <b>{currentEmploye.fonction}</b> pour <b>{currentEmploye.prenom} {currentEmploye.nom}</b>.
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de connexion</label>
                <input type="email" required value={currentEmploye.email} onChange={(e) => setCurrentEmploye({...currentEmploye, email: e.target.value})} className="w-full border p-2 rounded-md bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: jean.dupont@ecole.com"/>
                <p className="text-xs text-gray-400 mt-1">Sera utilisé comme identifiant de connexion.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe provisoire</label>
                <input type="text" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded-md bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: prof1234"/>
                <p className="text-xs text-gray-400 mt-1">À communiquer à l'employé.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                 <button type="button" onClick={() => setIsAccessModalOpen(false)} className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50">Annuler</button>
                 <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Créer le compte</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}