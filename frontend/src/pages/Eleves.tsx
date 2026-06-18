import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Search, Plus, Edit, Trash2, Eye, X, GraduationCap, BookOpen, Backpack, School } from "lucide-react";

// --- INTERFACES ---
interface Classe {
  id: number;
  nom: string;
  niveau: string;
}

interface Eleve {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  sexe: string;
  statut_inscription: string;
  observations: string | null;
  classe_id: number;
  classe?: Classe; // Sera rempli par React
  date_naissance?: string;
  lieu_naissance?: string;
  adresse?: string;
  telephone_parents?: string;
  responsable_legal?: string;
}

export default function Eleves() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEleve, setEditingEleve] = useState<Partial<Eleve> | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [elevesRes, classesRes] = await Promise.all([
        api.get("/eleves/"),
        api.get("/classes/")
      ]);

      const fetchedClasses = classesRes.data;
      
      // LA CORRECTION EST ICI : On associe manuellement la classe à l'élève pour le tableau
      const elevesAvecClasses = elevesRes.data.map((eleve: Eleve) => ({
        ...eleve,
        classe: fetchedClasses.find((c: Classe) => c.id === eleve.classe_id)
      }));

      // On trie aussi par ordre alphabétique par défaut
      elevesAvecClasses.sort((a: Eleve, b: Eleve) => a.nom.localeCompare(b.nom));

      setClasses(fetchedClasses);
      setEleves(elevesAvecClasses);
    } catch (error) {
      console.error("Erreur lors de la récupération des données", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "Inscrit":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">🟢 Inscrit</span>;
      case "Dossier Incomplet":
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">🟠 Incomplet</span>;
      case "En attente":
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">🔴 En attente</span>;
    }
  };

  const openModal = (eleve: Eleve | null = null) => {
    if (eleve) {
      setEditingEleve(eleve);
    } else {
      setEditingEleve({
        matricule: "", nom: "", prenom: "", sexe: "M", 
        statut_inscription: "En attente", observations: "", classe_id: classes[0]?.id || 0,
        date_naissance: "", lieu_naissance: "", adresse: "", telephone_parents: "", responsable_legal: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEleve(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // --- NOUVEAU : Nettoyage des données avant l'envoi ---
      const payload = { ...editingEleve };
      
      // 1. On retire l'objet 'classe' qui perturbe FastAPI
      delete payload.classe;
      
      // 2. On transforme les textes vides en 'null' pour la base de données
      if (payload.date_naissance === "") payload.date_naissance = null;
      if (payload.lieu_naissance === "") payload.lieu_naissance = null;
      if (payload.adresse === "") payload.adresse = null;
      if (payload.telephone_parents === "") payload.telephone_parents = null;
      if (payload.responsable_legal === "") payload.responsable_legal = null;
      if (payload.observations === "") payload.observations = null;
      // -----------------------------------------------------

      if (editingEleve?.id) {
        await api.put(`/eleves/${editingEleve.id}`, payload);
      } else {
        await api.post("/eleves/", payload); // On envoie le payload nettoyé !
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde", error);
      alert("Erreur lors de la sauvegarde. Vérifiez les données saisies.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir retirer cet élève ?")) {
      try {
        await api.delete(`/eleves/${id}`);
        fetchData();
      } catch (error) {
        console.error("Erreur de suppression", error);
      }
    }
  };

  // --- LOGIQUE DE GROUPEMENT PAR BLOCS ---
  const filteredEleves = eleves.filter(e => 
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.matricule && e.matricule.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCycleIcon = (cycle: string) => {
    switch(cycle) {
      case "Maternelle": return <School className="text-pink-500 mr-2" size={24} />;
      case "Primaire": return <Backpack className="text-blue-500 mr-2" size={24} />;
      case "Collège": return <BookOpen className="text-green-500 mr-2" size={24} />;
      case "Lycée": return <GraduationCap className="text-purple-500 mr-2" size={24} />;
      default: return <School className="text-gray-500 mr-2" size={24} />;
    }
  };

  // Fonction pour détecter le cycle en fonction du nom/niveau de la classe
  const getCycle = (classe?: Classe) => {
    if (!classe) return "Non assigné";
    const text = `${classe.nom} ${classe.niveau}`.toLowerCase();
    if (text.includes("maternelle") || text.includes("pré")) return "Maternelle";
    if (text.includes("primaire") || text.includes("cp") || text.includes("ce") || text.includes("cm")) return "Primaire";
    if (text.includes("collège") || text.includes("college") || text.includes("ème")) return "Collège";
    if (text.includes("lycée") || text.includes("lycee") || text.includes("seconde") || text.includes("première") || text.includes("terminale")) return "Lycée";
    return "Autres";
  };

  const cyclesOrder = ["Maternelle", "Primaire", "Collège", "Lycée", "Autres", "Non assigné"];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Élèves</h1>
          <p className="text-gray-500">Consultez les effectifs classés par cycle et gérez les dossiers.</p>
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow">
          <Plus size={20} className="mr-2" /> Inscrire un Élève
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center">
        <Search className="text-gray-400 mr-3" />
        <input type="text" placeholder="Rechercher par nom, prénom ou matricule..." className="w-full outline-none text-gray-700"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Chargement des élèves...</div>
      ) : (
        <div className="space-y-8">
          {/* On génère les blocs par cycle */}
          {cyclesOrder.map((cycle) => {
            const elevesDuCycle = filteredEleves.filter(e => getCycle(e.classe) === cycle);
            
            if (elevesDuCycle.length === 0) return null; // S'il n'y a pas d'élèves, on n'affiche pas le bloc

            return (
              <div key={cycle} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center">
                  {getCycleIcon(cycle)}
                  <h2 className="text-xl font-bold text-gray-800">{cycle}</h2>
                  <span className="ml-3 bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {elevesDuCycle.length} élève{elevesDuCycle.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                <table className="w-full text-left">
                  <thead className="bg-white text-gray-500 border-b border-gray-100 text-sm">
                    <tr>
                      <th className="px-6 py-3 font-medium">Matricule</th>
                      <th className="px-6 py-3 font-medium">Nom & Prénom</th>
                      <th className="px-6 py-3 font-medium">Classe</th>
                      <th className="px-6 py-3 font-medium">Statut</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elevesDuCycle.map((eleve) => (
                      <tr key={eleve.id} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-600 font-medium">{eleve.matricule || "-"}</td>
                        <td className="px-6 py-4 font-bold text-gray-800">{eleve.nom} {eleve.prenom}</td>
                        <td className="px-6 py-4 text-gray-600">{eleve.classe?.nom || "Non assignée"}</td>
                        <td className="px-6 py-4">{getStatusBadge(eleve.statut_inscription)}</td>
                        <td className="px-6 py-4 flex justify-end gap-2">
                          <button onClick={() => openModal(eleve)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Détails / Gérer">
                            <Eye size={18} />
                          </button>
                          <button onClick={() => handleDelete(eleve.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Retirer">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}

          {filteredEleves.length === 0 && (
             <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
               Aucun élève trouvé.
             </div>
          )}
        </div>
      )}

      {/* MODALE (Identique à la version précédente) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                {editingEleve?.id ? "Fiche Élève & Inscription" : "Nouvelle Inscription"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto">
              {/* SECTION 1 : IDENTITÉ */}
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-4">1. Identité de l'élève</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matricule *</label>
                  <input type="text" required className="w-full p-2 border rounded-lg"
                    value={editingEleve?.matricule || ""} onChange={e => setEditingEleve({...editingEleve, matricule: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Classe *</label>
                  <select className="w-full p-2 border rounded-lg"
                    value={editingEleve?.classe_id || ""} onChange={e => setEditingEleve({...editingEleve, classe_id: Number(e.target.value)})}>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.niveau} - {c.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input type="text" required className="w-full p-2 border rounded-lg"
                    value={editingEleve?.nom || ""} onChange={e => setEditingEleve({...editingEleve, nom: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input type="text" required className="w-full p-2 border rounded-lg"
                    value={editingEleve?.prenom || ""} onChange={e => setEditingEleve({...editingEleve, prenom: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
                  <select className="w-full p-2 border rounded-lg"
                    value={editingEleve?.sexe || "M"} onChange={e => setEditingEleve({...editingEleve, sexe: e.target.value})}>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                  <input type="date" className="w-full p-2 border rounded-lg"
                    value={editingEleve?.date_naissance || ""} onChange={e => setEditingEleve({...editingEleve, date_naissance: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
                  <input type="text" placeholder="Ex: Yaoundé" className="w-full p-2 border rounded-lg"
                    value={editingEleve?.lieu_naissance || ""} onChange={e => setEditingEleve({...editingEleve, lieu_naissance: e.target.value})} />
                </div>
              </div>

              {/* SECTION 2 : COORDONNÉES */}
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-4">2. Coordonnées & Parents</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsable légal</label>
                  <input type="text" placeholder="Ex: Jean Dupont (Père)" className="w-full p-2 border rounded-lg"
                    value={editingEleve?.responsable_legal || ""} onChange={e => setEditingEleve({...editingEleve, responsable_legal: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone Parents</label>
                  <input type="text" placeholder="Ex: 6XX XX XX XX" className="w-full p-2 border rounded-lg"
                    value={editingEleve?.telephone_parents || ""} onChange={e => setEditingEleve({...editingEleve, telephone_parents: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse / Quartier</label>
                  <input type="text" placeholder="Ex: Biyem-Assi, Yaoundé" className="w-full p-2 border rounded-lg"
                    value={editingEleve?.adresse || ""} onChange={e => setEditingEleve({...editingEleve, adresse: e.target.value})} />
                </div>
              </div>

              {/* SECTION 3 : INSCRIPTION */}
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-4">3. Statut & Observations</h3>
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">État du dossier</label>
                  <select className="w-full p-2 border rounded-lg bg-white"
                    value={editingEleve?.statut_inscription || "En attente"} 
                    onChange={e => setEditingEleve({...editingEleve, statut_inscription: e.target.value})}>
                    <option value="En attente">🔴 En attente (Pas encore fait / À traiter)</option>
                    <option value="Dossier Incomplet">🟠 Dossier Incomplet (Partiel)</option>
                    <option value="Inscrit">🟢 Inscrit (Fini)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observations / Remarques</label>
                  <textarea 
                    rows={3}
                    placeholder="Ex: Acompte payé, manque l'acte de naissance..."
                    className="w-full p-2 border rounded-lg bg-white resize-none"
                    value={editingEleve?.observations || ""} 
                    onChange={e => setEditingEleve({...editingEleve, observations: e.target.value})} 
                  />
                </div>
              </div>

              {/* BOUTONS */}
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  Annuler
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow">
                  Sauvegarder la fiche
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}