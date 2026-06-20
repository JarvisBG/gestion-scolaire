import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Classes from "./pages/Classes";
import Personnel from "./pages/Personnel";
import Eleves from "./pages/Eleves";
import Matieres from "./pages/Matieres";
import Parametres from "./pages/Parametres";
import Planning from './pages/Planning';

// 🛡️ LE GARDIEN DES ROUTES (Vérifie le Token ET le Rôle)
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "";

  // S'il n'y a pas de token, on retourne au login
  if (!token) return <Navigate to="/" replace />;

  // Si le rôle n'a pas la permission de voir cette page
  if (!allowedRoles.includes(role)) {
    // Redirection de repli : l'enseignant va au planning, les autres au dashboard
    if (role === "Enseignant") return <Navigate to="/planning" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // Tout va bien, on affiche le composant enfant !
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        
        <Route element={<Layout />}>
          {/* Réservé au Directeur et à la Secrétaire */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["Directeur", "Secrétaire"]}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/matieres" element={
            <ProtectedRoute allowedRoles={["Directeur", "Secrétaire"]}>
              <Matieres />
            </ProtectedRoute>
          } />

          {/* Réservé UNIQUEMENT au Directeur */}
          <Route path="/personnel" element={
            <ProtectedRoute allowedRoles={["Directeur"]}>
              <Personnel />
            </ProtectedRoute>
          } />
          
          <Route path="/parametres" element={
            <ProtectedRoute allowedRoles={["Directeur"]}>
              <Parametres />
            </ProtectedRoute>
          } />

          {/* Accessible à TOUS (Directeur, Secrétaire, Enseignant) */}
          <Route path="/classes" element={
            <ProtectedRoute allowedRoles={["Directeur", "Secrétaire", "Enseignant"]}>
              <Classes />
            </ProtectedRoute>
          } />
          
          <Route path="/eleves" element={
            <ProtectedRoute allowedRoles={["Directeur", "Secrétaire", "Enseignant"]}>
              <Eleves />
            </ProtectedRoute>
          } />
          
          <Route path="/planning" element={
            <ProtectedRoute allowedRoles={["Directeur", "Secrétaire", "Enseignant"]}>
              <Planning />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* S'il tape n'importe quoi dans l'URL, retour à la case départ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}