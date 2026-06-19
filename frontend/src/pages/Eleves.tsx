import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Search, Plus, Edit, Trash2, Eye, X, GraduationCap, BookOpen, Backpack, School, Download, Printer, Wallet, CreditCard, DollarSign } from "lucide-react";
import CertificatScolarite from "../components/CertificatScolarite.tsx";

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
  classe?: Classe;
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
  const [etablissement, setEtablissement] = useState<any>(null);
  const [certificatEleve, setCertificatEleve] = useState<Eleve | null>(null);
  const [activeTab, setActiveTab] = useState<"infos" | "coordonnees" | "finances">("infos");
  const [paiementsEleve, setPaiementsEleve] = useState<any[]>([]);
  const [nouveauPaiement, setNouveauPaiement] = useState({ montant: "", motif: "Tranche 1", mode_paiement: "Espèces" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [elevesRes, classesRes, paramRes] = await Promise.all([
        api.get("/eleves/"),
        api.get("/classes/"),
        api.get("/parametres/").catch(() => ({ data: null })) // On évite un crash si la table est vide
      ]);
      const fetchedClasses = classesRes.data;
      
      const elevesAvecClasses = elevesRes.data.map((eleve: Eleve) => ({
        ...eleve,
        classe: fetchedClasses.find((c: Classe) => c.id === eleve.classe_id)
      }));
      elevesAvecClasses.sort((a: Eleve, b: Eleve) => a.nom.localeCompare(b.nom));

      setClasses(fetchedClasses);
      setEleves(elevesAvecClasses);
      if (paramRes.data) setEtablissement(paramRes.data);
      
    } catch (error) {
      console.error("Erreur lors de la récupération des données", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "Inscrit": return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">🟢 Inscrit</span>;
      case "Dossier Incomplet": return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">🟠 Incomplet</span>;
      case "En attente":
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">🔴 En attente</span>;
    }
  };

  const openModal = async (eleve: any = null) => {
    // 1. On s'assure de toujours ouvrir sur le premier onglet
    setActiveTab("infos"); 

    if (eleve) {
      // --- CAS A : MODIFICATION D'UN ÉLÈVE EXISTANT ---
      setEditingEleve(eleve);
      
      // On charge son historique financier depuis le backend
      try {
        const res = await api.get(`/paiements/eleve/${eleve.id}`);
        setPaiementsEleve(res.data);
      } catch (error) {
        console.error("Erreur de chargement des paiements", error);
        setPaiementsEleve([]); // En cas d'erreur, on affiche une liste vide
      }
    } else {
      // --- CAS B : CRÉATION D'UN NOUVEL ÉLÈVE ---
      // On vide tous les champs, y compris les nouveaux (scolarite_totale)
      setEditingEleve({
        matricule: "", 
        nom: "", 
        prenom: "", 
        sexe: "M", 
        date_naissance: "", 
        lieu_naissance: "", 
        adresse: "", 
        telephone_parents: "", 
        responsable_legal: "",
        statut_inscription: "En attente", 
        observations: "", 
        classe_id: classes.length > 0 ? classes[0].id : 0,
        scolarite_totale: 0 // <-- Très important
      });
      // Un nouvel élève n'a pas encore de paiements
      setPaiementsEleve([]);
    }
    
    // On affiche enfin la fenêtre
    setIsModalOpen(true);
  };

  const handleEncaissement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEleve?.id) return;

    // --- 🛡️ LE BOUCLIER ANTI-DOUBLON ---
    // On cherche si un paiement avec le motif sélectionné existe déjà dans l'historique
    const paiementExistant = paiementsEleve.find(
      (p) => p.motif === nouveauPaiement.motif
    );

    if (paiementExistant) {
      alert(`⚠️ Attention : Le paiement pour "${nouveauPaiement.motif}" a déjà été enregistré pour cet élève !`);
      return; // On stoppe tout, la requête ne part pas vers le backend
    }
    // ------------------------------------

    try {
      await api.post("/paiements/", {
        ...nouveauPaiement,
        montant: parseFloat(nouveauPaiement.montant),
        date_paiement: new Date().toISOString().split('T')[0], // Date du jour
        eleve_id: editingEleve.id
      });
      
      // On rafraîchit la liste des paiements
      const res = await api.get(`/paiements/eleve/${editingEleve.id}`);
      setPaiementsEleve(res.data);
      setNouveauPaiement({ montant: "", motif: "Tranche 1", mode_paiement: "Espèces" }); // Reset
      alert("✅ Paiement enregistré avec succès !");
    } catch (error) {
      console.error("Erreur d'encaissement", error);
      alert("❌ Échec de l'enregistrement du paiement.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEleve(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...editingEleve };
      delete payload.classe;
      
      if (payload.date_naissance === "") payload.date_naissance = null;
      if (payload.lieu_naissance === "") payload.lieu_naissance = null;
      if (payload.adresse === "") payload.adresse = null;
      if (payload.telephone_parents === "") payload.telephone_parents = null;
      if (payload.responsable_legal === "") payload.responsable_legal = null;
      if (payload.observations === "") payload.observations = null;

      if (editingEleve?.id) {
        await api.put(`/eleves/${editingEleve.id}`, payload);
      } else {
        await api.post("/eleves/", payload);
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
      
      {/* En-tête : Câché à l'impression */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 print:hidden">
        <div>
          
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <GraduationCap className="w-8 h-8 mr-3 text-blue-600" />
            Gestion des Elèves
          </h2>
          <p className="text-gray-500">Consultez les effectifs classés par cycle et gérez les dossiers.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => window.print()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center font-medium transition-colors">
            <Download size={20} className="mr-2" /> Exporter PDF
          </button>
          <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow">
            <Plus size={20} className="mr-2" /> Inscrire un Élève
          </button>
        </div>
      </div>

      {/* Titre spécifique pour le document PDF imprimé */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">Liste des Élèves - Année 2025/2026</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center print:hidden">
        <Search className="text-gray-400 mr-3" />
        <input type="text" placeholder="Rechercher par nom, prénom ou matricule..." className="w-full outline-none text-gray-700"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Chargement des élèves...</div>
      ) : (
        <div className="space-y-8">
          {cyclesOrder.map((cycle) => {
            const elevesDuCycle = filteredEleves.filter(e => getCycle(e.classe) === cycle);
            
            if (elevesDuCycle.length === 0) return null;

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
                      <th className="px-6 py-3 font-medium text-right print:hidden">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elevesDuCycle.map((eleve) => (
                      <tr key={eleve.id} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-600 font-medium">{eleve.matricule || "-"}</td>
                        <td className="px-6 py-4 font-bold text-gray-800">{eleve.nom} {eleve.prenom}</td>
                        <td className="px-6 py-4 text-gray-600">{eleve.classe?.nom || "Non assignée"}</td>
                        <td className="px-6 py-4">{getStatusBadge(eleve.statut_inscription)}</td>
                        <td className="px-6 py-4 flex justify-end gap-2 print:hidden"></td>
                        <td className="px-6 py-4 flex justify-end gap-2 print:hidden">
                          <button onClick={() => setCertificatEleve(eleve)} className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors" title="Générer Certificat">
                            <Printer size={18} /></button>
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

      {/* MODALE : Cachée à l'impression */}
      {/* MODALE AVEC 3 ONGLETS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                {editingEleve?.id ? `Dossier de ${editingEleve.nom}` : "Nouvelle Inscription"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* BARRE DES 3 ONGLETS */}
            <div className="flex border-b bg-white px-6 pt-2 overflow-x-auto">
              <button 
                type="button"
                onClick={() => setActiveTab("infos")} 
                className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === "infos" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                📝 Identité & Scolarité
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab("coordonnees")} 
                className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === "coordonnees" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                👨‍👩‍👧 Coordonnées & Statut
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab("finances")} 
                disabled={!editingEleve?.id} 
                className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${!editingEleve?.id ? "opacity-50 cursor-not-allowed" : activeTab === "finances" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                💰 Finances & Paiements
              </button>
            </div>

            {/* CONTENU DYNAMIQUE DES ONGLETS */}
            <div className="overflow-y-auto flex-1 bg-white">
              
              {/* Le formulaire global englobe l'onglet 1 et l'onglet 2 pour qu'on puisse sauvegarder d'un coup */}
              <form id="eleve-form" onSubmit={handleSave} className={activeTab === "finances" ? "hidden" : "p-6"}>
                
                {/* ONGLET 1 : IDENTITÉ */}
                <div className={activeTab === "infos" ? "block" : "hidden"}>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Matricule *</label>
                      <input type="text" required className="w-full p-2 border rounded-lg"
                        value={editingEleve?.matricule || ""} onChange={e => setEditingEleve({...editingEleve, matricule: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Classe *</label>
                      <select className="w-full p-2 border rounded-lg bg-white"
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
                      <select className="w-full p-2 border rounded-lg bg-white"
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
                </div>

                {/* ONGLET 2 : COORDONNÉES & STATUT */}
                <div className={activeTab === "coordonnees" ? "block" : "hidden"}>
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

                  {/* Zone de tarification bien mise en évidence */}
                  <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <label className="block text-sm font-bold text-yellow-800 mb-1 flex items-center">
                      <DollarSign size={18} className="mr-1"/> Scolarité totale exigée (FCFA)
                    </label>
                    <input type="number" className="w-full p-2 border border-yellow-300 rounded-lg bg-white text-lg font-medium"
                      value={editingEleve?.scolarite_totale || ""} onChange={e => setEditingEleve({...editingEleve, scolarite_totale: Number(e.target.value)})} 
                      placeholder="Ex: 150000" />
                  </div>

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
                </div>

              </form>

              {/* ONGLET 3 : FINANCES (Affiché seulement si on est sur l'onglet finances) */}
              {activeTab === "finances" && (
                <div className="p-6">
                  
                  {/* Résumé Financier */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-xl border">
                      <p className="text-sm text-gray-500 font-medium">Scolarité Totale</p>
                      <h3 className="text-xl font-bold text-gray-800">{editingEleve?.scolarite_totale?.toLocaleString("fr-FR")} FCFA</h3>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <p className="text-sm text-green-600 font-medium">Déjà Payé</p>
                      <h3 className="text-xl font-bold text-green-700">
                        {paiementsEleve.reduce((acc, p) => acc + p.montant, 0).toLocaleString("fr-FR")} FCFA
                      </h3>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                      <p className="text-sm text-red-600 font-medium">Reste à Payer</p>
                      <h3 className="text-xl font-bold text-red-700">
                        {((editingEleve?.scolarite_totale || 0) - paiementsEleve.reduce((acc, p) => acc + p.montant, 0)).toLocaleString("fr-FR")} FCFA
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Colonne d'Encaissement */}
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Wallet className="mr-2 text-green-600" size={18} /> Nouvel Encaissement</h3>
                      <form onSubmit={handleEncaissement} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA) *</label>
                          <input type="number" required value={nouveauPaiement.montant} onChange={e => setNouveauPaiement({...nouveauPaiement, montant: e.target.value})} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Motif *</label>
                          <select value={nouveauPaiement.motif} onChange={e => setNouveauPaiement({...nouveauPaiement, motif: e.target.value})} className="w-full p-2 border rounded-lg bg-white">
                            <option value="Frais d'inscription">Frais d'inscription</option>
                            <option value="Tranche 1">Tranche 1</option>
                            <option value="Tranche 2">Tranche 2</option>
                            <option value="Tranche 3">Tranche 3</option>
                            <option value="APE / APD">A.P.E</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement *</label>
                          <select value={nouveauPaiement.mode_paiement} onChange={e => setNouveauPaiement({...nouveauPaiement, mode_paiement: e.target.value})} className="w-full p-2 border rounded-lg bg-white">
                            <option value="Espèces">Espèces</option>
                            <option value="Mobile Money">Mobile Money</option>
                            <option value="Orange Money">Orange Money</option>
                            <option value="Virement Bancaire">Virement Bancaire</option>
                          </select>
                        </div>
                        <button type="submit" className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors mt-2">
                          Valider le paiement
                        </button>
                      </form>
                    </div>

                    {/* Historique des paiements */}
                    <div className="md:col-span-2 bg-white p-5 rounded-xl border shadow-sm flex flex-col">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center"><CreditCard className="mr-2 text-blue-600" size={18} /> Historique des reçus</h3>
                      {paiementsEleve.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 py-8 bg-gray-50 rounded-lg">Aucun paiement enregistré.</div>
                      ) : (
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                          {paiementsEleve.map(paiement => (
                            <div key={paiement.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                              <div>
                                <p className="font-bold text-gray-800">{paiement.motif}</p>
                                <p className="text-xs text-gray-500">{new Date(paiement.date_paiement).toLocaleDateString("fr-FR")} • {paiement.mode_paiement}</p>
                              </div>
                              <span className="font-bold text-green-700">+{paiement.montant.toLocaleString("fr-FR")} FCFA</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* FOOTER DE LA MODALE */}
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                Fermer
              </button>
              {/* Le bouton de sauvegarde n'apparaît pas sur l'onglet finances car les paiements s'enregistrent instantanément via leur propre bouton */}
              {activeTab !== "finances" && (
                <button type="submit" form="eleve-form" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow transition-colors">
                  Sauvegarder la fiche
                </button>
              )}
            </div>

          </div>
        </div>
      )}
      {/* MODALE : Certificat de Scolarité */}
      {certificatEleve && (
        <CertificatScolarite
          eleve={certificatEleve}
          etablissement={etablissement}
          onClose={() => setCertificatEleve(null)}
        />
      )}
    </div>
  );
}