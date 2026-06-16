import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Classes from "./pages/Classes";
import Personnel from "./pages/Personnel";
import Eleves from "./pages/Eleves";
import Matieres from "./pages/Matieres";
import Parametres from "./pages/Parametres";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        
        {/* Toutes les pages qui nécessitent la barre latérale sont dans le Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/personnel" element={<Personnel />} />
          <Route path="/eleves" element={<Eleves />} />
          <Route path="/matieres" element={<Matieres />} />
          <Route path="/parametres" element={<Parametres />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}