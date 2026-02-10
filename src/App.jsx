import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Leads from "./pages/Leads.jsx";
import QrCodeWhatsapp from "./components/QrCode.jsx";
import Relatorios from "./pages/Relatorios.jsx";
import Login from "./pages/Login.jsx";
import Usuarios from "./pages/Usuarios.jsx";
import Disparador from "./pages/Disparador.jsx";
import CriarCampanha from "./pages/CriarCampanha.jsx";
import GerenciarContatos from "./pages/GerenciarContatos.jsx";

// Componente para proteger rotas
function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
                <Sidebar />
                <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 transition-all duration-300 md:ml-64">
                  <div className="flex-1 w-full max-w-6xl mx-auto">
                    <Leads />
                  </div>
                </main>
              </div>
            </RequireAuth>
          }
        />
        <Route
          path="/leads"
          element={
            <RequireAuth>
              <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
                <Sidebar />
                <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 transition-all duration-300 md:ml-64">
                  <div className="flex-1 w-full max-w-6xl mx-auto">
                    <Leads />
                  </div>
                </main>
              </div>
            </RequireAuth>
          }
        />
        <Route
          path="/qr"
          element={
            <RequireAuth>
              <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
                <Sidebar />
                <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 transition-all duration-300 md:ml-64">
                  <div className="flex-1 w-full max-w-6xl mx-auto">
                    <QrCodeWhatsapp />
                  </div>
                </main>
              </div>
            </RequireAuth>
          }
        />
        <Route
          path="/relatorios"
          element={
            <RequireAuth>
              <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
                <Sidebar />
                <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 transition-all duration-300 md:ml-64">
                  <div className="flex-1 w-full max-w-6xl mx-auto">
                    <Relatorios />
                  </div>
                </main>
              </div>
            </RequireAuth>
          }
        />
        <Route
          path="/usuarios"
          element={
            <RequireAuth>
              <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
                <Sidebar />
                <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 transition-all duration-300 md:ml-64">
                  <div className="flex-1 w-full max-w-6xl mx-auto">
                    <Usuarios />
                  </div>
                </main>
              </div>
            </RequireAuth>
          }
        />
        <Route
          path="/disparador"
          element={
            <RequireAuth>
              <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
                <Sidebar />
                <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 transition-all duration-300 md:ml-64">
                  <div className="flex-1 w-full max-w-6xl mx-auto">
                    <Disparador />
                  </div>
                </main>
              </div>
            </RequireAuth>
          }
        />
        <Route
          path="/campanhas"
          element={
            <RequireAuth>
              <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
                <Sidebar />
                <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 transition-all duration-300 md:ml-64">
                  <div className="flex-1 w-full max-w-6xl mx-auto">
                    <CriarCampanha />
                  </div>
                </main>
              </div>
            </RequireAuth>
          }
        />
        <Route
          path="/contatos"
          element={
            <RequireAuth>
              <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
                <Sidebar />
                <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 transition-all duration-300 md:ml-64">
                  <div className="flex-1 w-full max-w-6xl mx-auto">
                    <GerenciarContatos />
                  </div>
                </main>
              </div>
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
