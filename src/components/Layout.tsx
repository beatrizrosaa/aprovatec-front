import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-900 transition-colors">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur no-print">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/semestres" className="text-emerald-400 font-semibold text-xl">
            AprovaTec
          </Link>
          {user && (
            <div className="flex items-center gap-3 sm:gap-4 text-sm text-slate-200">
              <button
                onClick={toggleTheme}
                className="px-3 py-1 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
                aria-label="Alternar tema"
              >
                {theme === "light" ? "Modo claro" : "Modo escuro"}
              </button>
              <nav className="hidden sm:flex items-center gap-3">
                <Link
                  to="/semestres"
                  className="px-3 py-1 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
                >
                  Lançar notas
                </Link>
                <Link
                  to="/dashboard"
                  className="px-3 py-1 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
                >
                  Dashboard
                </Link>
              </nav>
              <span className="hidden sm:inline">Olá, {user.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-md border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 transition"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default Layout;
