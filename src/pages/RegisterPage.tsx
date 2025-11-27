import React, { useState } from "react";
import { apiFetch } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });
      showToast(data.message || "Cadastro realizado com sucesso", "success");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err: any) {
      showToast(err.message || "Erro ao cadastrar", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-2 text-white">Criar conta</h1>
        <p className="text-center text-slate-400 text-sm mb-6">
          Cadastre-se para começar a usar o AprovaTec.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-200 mb-1">Nome</label>
            <input
              type="text"
              className="w-full rounded-md px-3 py-2 bg-slate-800 text-white outline-none focus:ring-2 focus:ring-emerald-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-200 mb-1">E-mail</label>
            <input
              type="email"
              className="w-full rounded-md px-3 py-2 bg-slate-800 text-white outline-none focus:ring-2 focus:ring-emerald-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-200 mb-1">Senha</label>
            <input
              type="password"
              className="w-full rounded-md px-3 py-2 bg-slate-800 text-white outline-none focus:ring-2 focus:ring-emerald-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            disabled={loading}
            className="w-full py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition disabled:opacity-60"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
        <p className="text-center text-slate-400 text-sm mt-4">
          Já tem conta?{" "}
          <Link to="/login" className="text-emerald-400 hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
