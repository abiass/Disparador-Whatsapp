import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Recupera nome do usuário logado do localStorage

  let usuarioNome = "Usuário";
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      usuarioNome = payload.nome || payload.user || "Usuário";
    }
  } catch {}

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  // Monta menu com todos os itens disponíveis
  let menuItems = [
    {
      id: "leads",
      name: "Leads",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      path: "/leads",
    },
    {
      id: "usuarios",
      name: "Usuários",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.121 17.804A4 4 0 017 16h10a4 4 0 011.879.804M15 11a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      path: "/usuarios",
    },
    {
      id: "relatorios",
      name: "Relatórios",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2a4 4 0 014-4h6m-6 0V7a4 4 0 00-4-4H5a4 4 0 00-4 4v10a4 4 0 004 4h6a4 4 0 004-4z"
          />
        </svg>
      ),
      path: "/relatorios",
    },
    {
      id: "campanhas",
      name: "Campanhas",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5.882V19.24a1.961 1.961 0 01-2.404 1.926c-1.781-.488-3.21-2.04-3.21-3.926V5.882m14.846 0a2.25 2.25 0 00-2.248-2.25h-.5A2.25 2.25 0 0019.5 5.882v14.358a2.25 2.25 0 01-2.248 2.25h-.5A2.25 2.25 0 0114.5 20.12V5.882m0 0H5.882c-1.065 0-2.07.393-2.825 1.1m17.409 0a2.25 2.25 0 00-1.574-1.1m0 0H21a2.25 2.25 0 012.25 2.25v12A2.25 2.25 0 0121 21H5.882a2.25 2.25 0 01-2.25-2.25V6.882a2.25 2.25 0 012.25-2.25h14.118z"
          />
        </svg>
      ),
      path: "/campanhas",
    },
    {
      id: "disparador",
      name: "Disparador",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      path: "/disparador",
    },
    {
      id: "contatos",
      name: "Gerenciar Contatos",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
      path: "/contatos",
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-green-600 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-green-600 to-green-700 text-white shadow-xl">
          <div className="p-4 flex justify-between items-center border-b border-green-500">
            <span className="text-xl font-bold">Painel WhatsApp</span>
            <button onClick={() => setIsOpen(false)}>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.path)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-green-500"
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="sidebar hidden md:flex flex-col w-64 h-screen bg-gradient-to-b from-green-600 via-blue-600 to-blue-800 text-white shadow-2xl flex-shrink-0 rounded-r-3xl overflow-hidden fixed top-0 left-0 z-40">
        {/* Header */}
        <div className="p-6 border-b border-blue-500 flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-500 to-blue-600 p-2 rounded-full shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m-6 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow">
            Painel Velox
          </h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-6 space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-150 shadow-sm ${
                location.pathname === item.path
                  ? "bg-white/20 text-blue-100 shadow-lg scale-[1.03]"
                  : "text-white hover:bg-white/10 hover:scale-[1.01]"
              }`}
            >
              <div className="w-6 h-6 text-white/90">{item.icon}</div>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-blue-500">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-lg font-bold text-white">U</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-white/90">
                {usuarioNome}
              </p>
              <div className="flex w-full">
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                  }}
                  className="ml-auto max-w-max px-3 py-2 rounded-md text-sm text-white/90 bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
                  aria-label="Sair"
                >
                  <svg
                    className="w-4 h-4 text-white/80"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                    />
                  </svg>
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
