import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, School, Users, GraduationCap, BookOpen, Settings, LogOut } from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const menuItems = [
    { path: "/dashboard", name: "Tableau de bord", icon: LayoutDashboard },
    { path: "/classes", name: "Classes", icon: School },
    { path: "/personnel", name: "Personnel", icon: Users },
    { path: "/eleves", name: "Élèves", icon: GraduationCap },
    { path: "/matieres", name: "Matières", icon: BookOpen },
    { path: "/parametres", name: "Paramètres", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Colonne de Gauche (Sidebar) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <GraduationCap className="w-8 h-8 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-800">GestionScolaire</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout} 
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu Principal (La page dynamique) */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Outlet est la zone où la page sélectionnée va s'afficher */}
        <Outlet /> 
      </main>
    </div>
  );
}