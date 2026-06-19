import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Users, School, BookOpen, UserCheck, AlertCircle, LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEleves: 0,
    filles: 0,
    garcons: 0,
    nonPrecise: 0,
    totalClasses: 0,
    totalPersonnel: 0,
    totalEnseignants: 0,
    elevesParCycle: { Maternelle: 0, Primaire: 0, Collège: 0, Lycée: 0 },
    recentEleves: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Comme pour les classes, on sépare pour éviter qu'une erreur sur /personnel ne bloque le reste
      let eleves = [];
      let classes = [];
      let personnel = [];

      try {
        const elevesRes = await api.get("/eleves/");
        eleves = elevesRes.data;
      } catch (e) { console.error("Erreur chargement élèves", e); }

      try {
        const classesRes = await api.get("/classes/");
        classes = classesRes.data;
      } catch (e) { console.error("Erreur chargement classes", e); }

      try {
        const personnelRes = await api.get("/personnel/");
        personnel = personnelRes.data;
      } catch (e) { console.error("Erreur chargement personnel", e); }
      
      // 1. Calculs ultra-robustes Filles / Garçons (Protection contre les null)
      const garcons = eleves.filter((e: any) => {
        const s = (e.sexe || "").toString().trim().toUpperCase();
        return s === "M" || s === "MASCULIN";
      }).length;

      const filles = eleves.filter((e: any) => {
        const s = (e.sexe || "").toString().trim().toUpperCase();
        return s === "F" || s === "FÉMININ" || s === "FEMININ";
      }).length;
      
      const nonPrecise = eleves.length - garcons - filles;

      // 2. Calcul des Enseignants
      const enseignants = personnel.filter((p: any) => p.fonction === "Enseignant").length;

      // 3. Les 3 derniers inscrits
      const recents = [...eleves].sort((a, b) => b.id - a.id).slice(0, 3);

      // 4. Calcul du graphique
      const cycles = { Maternelle: 0, Primaire: 0, Collège: 0, Lycée: 0 };
      eleves.forEach((eleve: any) => {
        const classeDeLeleve = classes.find((c: any) => c.id === eleve.classe_id || c.id === Number(eleve.classe_id));
        
        if (classeDeLeleve && classeDeLeleve.niveau) {
          const niveau = classeDeLeleve.niveau.toLowerCase();
          
          if (niveau.includes("maternelle")) cycles.Maternelle++;
          else if (niveau.includes("primaire")) cycles.Primaire++;
          else if (niveau.includes("collège") || niveau.includes("college")) cycles.Collège++;
          else if (niveau.includes("lycée") || niveau.includes("lycee")) cycles.Lycée++;
          // Fallback : si le niveau ne correspond à rien de précis, on se base sur le nom
          else {
             const text = `${classeDeLeleve.nom}`.toLowerCase();
             if (text.includes("maternelle") || text.includes("pré")) cycles.Maternelle++;
             else if (text.includes("cp") || text.includes("ce") || text.includes("cm")) cycles.Primaire++;
             else if (text.includes("ème") || text.includes("6e") || text.includes("3e") || text.includes("4e") || text.includes("5e")) cycles.Collège++;
             else if (text.includes("seconde") || text.includes("première") || text.includes("terminale")) cycles.Lycée++;
          }
        }
      });

      setStats({
        totalEleves: eleves.length,
        filles,
        garcons,
        nonPrecise,
        totalClasses: classes.length,
        totalPersonnel: personnel.length,
        totalEnseignants: enseignants,
        elevesParCycle: cycles,
        recentEleves: recents
      });

    } catch (error) {
      console.error("Erreur fatale chargement dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement du tableau de bord...</div>;

  const maxEffectif = Math.max(...Object.values(stats.elevesParCycle), 1); 

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <LayoutDashboard className="mr-3 text-blue-600" size={32} />
            Aperçu Général
          </h1>
          <p className="text-gray-500 mt-1">Bienvenue sur votre espace de gestion d'établissement.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium border border-blue-100 shadow-sm">
          📅 Année Scolaire Active : 2025-2026
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-lg mr-4"><Users size={28} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Élèves</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalEleves}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {stats.garcons} Garçons • {stats.filles} Filles
              {stats.nonPrecise > 0 && ` • ${stats.nonPrecise} N/R`}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-green-50 text-green-600 rounded-lg mr-4"><School size={28} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Classes Actives</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalClasses}</h3>
            <p className="text-xs text-green-500 mt-1">Salles attribuées</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-lg mr-4"><BookOpen size={28} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Enseignants</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalEnseignants}</h3>
            <p className="text-xs text-purple-500 mt-1">Équipe pédagogique</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-lg mr-4"><UserCheck size={28} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Personnel</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalPersonnel}</h3>
            <p className="text-xs text-orange-500 mt-1">Membres enregistrés</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <School className="mr-2 text-blue-600" size={20}/> Répartition par Cycle
          </h3>
          <div className="flex items-end justify-around h-64 mt-4 border-b border-gray-200 pb-2 relative">
            {Object.entries(stats.elevesParCycle).map(([cycle, count]) => {
              const heightPercentage = (count / maxEffectif) * 100;
              return (
                <div key={cycle} className="flex flex-col items-center w-1/5 group h-full justify-end">
                  <span className="mb-2 text-sm font-bold text-blue-600 transition-opacity">{count} élève(s)</span>
                  <div 
                    className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all duration-700 ease-out"
                    style={{ height: `${Math.max(heightPercentage, 2)}%` }} 
                  ></div>
                  <span className="mt-3 text-sm font-medium text-gray-600">{cycle}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <AlertCircle className="mr-2 text-red-500" size={20}/> Alertes
            </h3>
            <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm mb-3 border border-yellow-100 font-medium">
              Validation des notes en attente
            </div>
            <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 font-medium">
              Réunion parents-professeurs vendredi
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Élèves récents</h3>
            {stats.recentEleves.length > 0 ? (
              <div className="space-y-3">
                {stats.recentEleves.map(eleve => (
                  <div key={eleve.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{eleve.nom} {eleve.prenom}</p>
                      <p className="text-xs text-gray-500">Matricule: {eleve.matricule || "-"}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Nouveau</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                Aucun élève.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}