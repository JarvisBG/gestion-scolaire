import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, Trash2, BookOpen } from "lucide-react";

export default function Planning() {
  // --- ÉTATS (STATES) ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [seances, setSeances] = useState<any[]>([]);
  
  // Données pour les menus déroulants
  const [classes, setClasses] = useState<any[]>([]);
  const [matieres, setMatieres] = useState<any[]>([]);
  const [profs, setProfs] = useState<any[]>([]);
  const [salles, setSalles] = useState<any[]>([]);

  // Modale d'ajout
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSeance, setNewSeance] = useState({
    heure_debut: "08:00", heure_fin: "10:00",
    classe_id: "", matiere_id: "", prof_id: "", salle_id: ""
  });

  // --- CHARGEMENT INITIAL ---
  useEffect(() => {
    fetchAllData();
  }, []);

  // Recharge les séances à chaque fois qu'on change de jour
  useEffect(() => {
    fetchSeancesForDay(currentDate);
  }, [currentDate]);

  const fetchAllData = async () => {
    try {
      const [clsRes, matRes, persRes, salleRes] = await Promise.all([
        api.get("/classes/"),
        api.get("/matieres/"),
        api.get("/personnel/"),
        api.get("/calendrier/salles/")
      ]);
      setClasses(clsRes.data);
      setMatieres(matRes.data);
      // On ne garde que les enseignants
      setProfs(persRes.data.filter((p: any) => p.fonction === "Enseignant"));
      setSalles(salleRes.data);

      // On pré-remplit le formulaire avec le premier choix disponible
      if (clsRes.data.length && matRes.data.length && persRes.data.length) {
        setNewSeance(prev => ({
          ...prev,
          classe_id: clsRes.data[0].id,
          matiere_id: matRes.data[0].id,
          prof_id: persRes.data.find((p:any) => p.fonction === "Enseignant")?.id || "",
          salle_id: "" // Vide par défaut (Salle habituelle)
        }));
      }
    } catch (error) {
      console.error("Erreur de chargement des données de base", error);
    }
  };

  const fetchSeancesForDay = async (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
    try {
      const res = await api.get(`/calendrier/seances/?date_debut=${dateStr}&date_fin=${dateStr}`);
      setSeances(res.data);
    } catch (error) {
      console.error("Erreur de chargement du planning", error);
    }
  };

  // --- ACTIONS ---
  const changeDay = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  const handleCreateSeance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Préparation propre des données pour le backend
      const payload = {
        ...newSeance,
        date_seance: currentDate.toISOString().split('T')[0],
        classe_id: Number(newSeance.classe_id),
        matiere_id: Number(newSeance.matiere_id),
        prof_id: Number(newSeance.prof_id),
        // Si le champ salle est vide, on envoie null (Le backend comprendra que c'est la salle par défaut)
        salle_id: newSeance.salle_id ? Number(newSeance.salle_id) : null 
      };
      
      await api.post("/calendrier/seances/", payload);
      alert("✅ Cours programmé avec succès !");
      setIsModalOpen(false);
      fetchSeancesForDay(currentDate); // On rafraîchit la grille
    } catch (error: any) {
      // C'EST ICI QUE LE BOUCLIER ANTI-COLLISION DU BACKEND S'ACTIVE !
      alert("❌ " + (error.response?.data?.detail || "Erreur de programmation"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Annuler ce cours ?")) return;
    try {
      await api.delete(`/calendrier/seances/${id}`);
      fetchSeancesForDay(currentDate);
    } catch (error) {
      console.error("Erreur suppression", error);
    }
  };

  // --- RENDU VISUEL ---
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* EN-TÊTE ET NAVIGATION */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <CalendarIcon className="mr-3 text-blue-600" size={28} /> Planning Dynamique
        </h1>

        {/* Le contrôleur de date */}
        <div className="flex items-center bg-gray-50 rounded-lg p-1 border">
          <button onClick={() => changeDay(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded transition-all"><ChevronLeft size={20} /></button>
          <div className="px-6 font-bold text-gray-800 min-w-[200px] text-center">
            {currentDate.toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
          </div>
          <button onClick={() => changeDay(1)} className="p-2 hover:bg-white hover:shadow-sm rounded transition-all"><ChevronRight size={20} /></button>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={20} className="mr-2" /> Programmer un cours
        </button>
      </div>

      {/* LA GRILLE DES COURS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
        {seances.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
            <CalendarIcon size={64} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">Aucun cours programmé pour cette journée.</p>
            <p className="text-sm">Cliquez sur "Programmer un cours" pour commencer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seances.map((seance) => {
              const matiereCouleur = matieres.find(m => m.nom === seance.matiere_nom)?.couleur || "#3B82F6";
              
              return (
                <div key={seance.id} className="relative rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full bg-white">
                  {/* Liseré de couleur */}
                  <div className="h-2 w-full" style={{ backgroundColor: matiereCouleur }}></div>
                  
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 font-bold text-sm rounded-lg flex items-center border">
                        <Clock size={14} className="mr-1.5" /> {seance.heure_debut.slice(0,5)} - {seance.heure_fin.slice(0,5)}
                      </span>
                      <button onClick={() => handleDelete(seance.id)} className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <h3 className="text-xl font-black text-gray-800 mb-1">{seance.classe_nom}</h3>
                    <p className="font-bold text-lg mb-4 flex items-center" style={{ color: matiereCouleur }}>
                      <BookOpen size={18} className="mr-2" /> {seance.matiere_nom}
                    </p>

                    <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
                      <p className="flex items-center"><User size={16} className="mr-2 text-gray-400" /> {seance.prof_nom}</p>
                      <p className="flex items-center font-medium"><MapPin size={16} className="mr-2 text-gray-400" /> {seance.salle_nom}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALE : PROGRAMMER UN COURS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Nouveau cours</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
            </div>

            <form onSubmit={handleCreateSeance} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
                  <input type="time" required value={newSeance.heure_debut} onChange={e => setNewSeance({...newSeance, heure_debut: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
                  <input type="time" required value={newSeance.heure_fin} onChange={e => setNewSeance({...newSeance, heure_fin: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classe *</label>
                <select required value={newSeance.classe_id} onChange={e => setNewSeance({...newSeance, classe_id: e.target.value})} className="w-full p-2 border rounded-lg bg-white">
                  {classes.map(c => <option key={c.id} value={c.id}>{c.niveau} - {c.nom}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matière *</label>
                <select required value={newSeance.matiere_id} onChange={e => setNewSeance({...newSeance, matiere_id: e.target.value})} className="w-full p-2 border rounded-lg bg-white">
                  {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professeur *</label>
                <select required value={newSeance.prof_id} onChange={e => setNewSeance({...newSeance, prof_id: e.target.value})} className="w-full p-2 border rounded-lg bg-white">
                  {profs.map(p => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local / Salle (Optionnel)</label>
                <select value={newSeance.salle_id} onChange={e => setNewSeance({...newSeance, salle_id: e.target.value})} className="w-full p-2 border rounded-lg bg-white">
                  <option value="">-- Salle de classe habituelle --</option>
                  {salles.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">Laissez vide si le cours a lieu dans la salle principale de la classe.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Annuler</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors">Programmer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}