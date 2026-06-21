import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, School, Users, GraduationCap, BookOpen, Settings, LogOut, Calendar, Menu, X } from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();
  // On lit le rôle depuis le localStorage
  const userRole = localStorage.getItem("role") || "Enseignant";
  
  // État pour gérer l'ouverture/fermeture du menu sur mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear(); // Efface le token ET le rôle d'un coup
    navigate("/");
  };

  // 🛡️ MATRICE DES ACCÈS POUR LE MENU
  const menuItems = [
    { path: "/dashboard", name: "Tableau de bord", icon: LayoutDashboard, roles: ["Directeur", "Secrétaire"] },
    { path: "/classes", name: "Classes", icon: School, roles: ["Directeur", "Secrétaire", "Enseignant"] },
    { path: "/personnel", name: "Personnel", icon: Users, roles: ["Directeur"] }, // Le boss uniquement !
    { path: "/eleves", name: "Élèves", icon: GraduationCap, roles: ["Directeur", "Secrétaire", "Enseignant"] },
    { path: "/matieres", name: "Matières", icon: BookOpen, roles: ["Directeur", "Secrétaire"] },
    { path: "/planning", name: "Planning", icon: Calendar, roles: ["Directeur", "Secrétaire", "Enseignant"] },
    { path: "/parametres", name: "Paramètres", icon: Settings, roles: ["Directeur"] },
  ];

  // LE CAMÉLÉON : On filtre les menus en fonction du rôle de l'utilisateur
  const allowedMenus = menuItems.filter(item => item.roles.includes(userRole));

  // Fermer le menu sur mobile quand on clique sur un lien
  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden print:h-auto print:bg-white print:overflow-visible relative">
      
      {/* 📱 HEADER MOBILE (Visible uniquement sur petits écrans) */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 w-full absolute top-0 z-30 print:hidden">
        <div className="flex items-center">
          <GraduationCap className="w-6 h-6 text-blue-600 mr-2" />
          <span className="text-lg font-bold text-gray-800">GestionScolaire</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* 🌑 OVERLAY MOBILE (Fond noir semi-transparent quand le menu est ouvert) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden print:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 🖥️ SIDEBAR PRINCIPALE (Adaptative Mobile / PC) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out print:hidden
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0
      `}>
        {/* En-tête avec badge dynamique */}
        <div className="h-auto flex flex-col justify-center px-6 py-6 border-b border-gray-200 relative">
          {/* Bouton fermer sur mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 md:hidden text-gray-500 hover:text-gray-800"
          >
            <X size={20} />
          </button>

          <div className="flex items-center mt-2 md:mt-0">
            <GraduationCap className="w-8 h-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-800">GestionScolaire</span>
          </div>
          {/* Badge indiquant le rôle actuel */}
          <div className="mt-3 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded w-fit uppercase tracking-wider">
            Espace {userRole}
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {allowedMenus.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
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

      {/* 📄 ZONE DE CONTENU PRINCIPALE */}
      <main className="flex-1 overflow-y-auto mt-16 md:mt-0 p-4 md:p-8 print:p-0 print:overflow-visible">
        <Outlet /> 
      </main>
    </div>
  );
}