import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Users, School, BookOpen, AlertCircle, Calendar, TrendingUp } from "lucide-react";

interface DashboardData {
  annee_active: string;
  effectifs: { total: number; garcons: number; filles: number };
  classes: number;
  personnel: { enseignants: number; total: number };
  alertes: { id: number; message: string; type: string }[];
  eleves_recents: any[];
  graphique_inscriptions: { mois: string; élèves: number }[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/stats");
        setData(response.data);
      } catch (error) {
        console.error("Erreur de récupération des données", error);
        navigate("/"); 
      }
    };
    fetchStats();
  }, [navigate]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Chargement du tableau de bord...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Aperçu Général</h2>
          <p className="text-sm text-gray-500 mt-1">
            Bienvenue sur votre espace de gestion d'établissement.
          </p>
        </div>
        <span className="flex items-center text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full shadow-sm">
          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
          Année Scolaire Active : {data.annee_active}
        </span>
      </div>

      {/* Grille des indicateurs clés (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Élèves */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Total Élèves</p>
            <h2 className="text-2xl font-bold text-gray-800">{data.effectifs.total}</h2>
            <p className="text-xs font-medium text-gray-500 mt-1">
              {data.effectifs.garcons} G • {data.effectifs.filles} F
            </p>
          </div>
        </div>

        {/* Classes */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-green-50 rounded-xl text-green-600">
            <School className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Classes Actives</p>
            <h2 className="text-2xl font-bold text-gray-800">{data.classes}</h2>
            <p className="text-xs text-green-500 font-medium mt-1">Salles attribuées</p>
          </div>
        </div>

        {/* Enseignants */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-purple-50 rounded-xl text-purple-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Enseignants</p>
            <h2 className="text-2xl font-bold text-gray-800">{data.personnel.enseignants}</h2>
            <p className="text-xs text-purple-500 font-medium mt-1">Équipe pédagogique</p>
          </div>
        </div>

        {/* Total Personnel */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-orange-50 rounded-xl text-orange-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Total Personnel</p>
            <h2 className="text-2xl font-bold text-gray-800">{data.personnel.total}</h2>
            <p className="text-xs text-orange-500 font-medium mt-1">Membres enregistrés</p>
          </div>
        </div>
      </div>

      {/* Section Graphique & Éléments contextuels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique des effectifs */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-800">Graphique des effectifs</h3>
          </div>
          <div className="h-72 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.graphique_inscriptions}>
                <XAxis dataKey="mois" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "#f3f4f6" }} />
                <Bar dataKey="élèves" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Colonne latérale droite : Alertes & Éleves récents */}
        <div className="space-y-6">
          {/* Alertes importantes */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-500" /> Alertes importantes
            </h3>
            <div className="space-y-3">
              {data.alertes.map((alerte) => (
                <div
                  key={alerte.id}
                  className={`p-3 rounded-lg text-sm border-l-4 shadow-sm ${
                    alerte.type === "warning"
                      ? "bg-yellow-50 border-yellow-400 text-yellow-800"
                      : "bg-blue-50 border-blue-400 text-blue-800"
                  }`}
                >
                  {alerte.message}
                </div>
              ))}
            </div>
          </div>

          {/* Élèves récemment inscrits */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Élèves récemment inscrits</h3>
            {data.eleves_recents.length > 0 ? (
              <ul className="space-y-2">
                {/* Dynamisé à la prochaine étape */}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic text-center py-6 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                Aucun élève récemment inscrit.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}