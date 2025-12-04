import React, { useContext, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import SemesterCard, { Semester } from "../components/SemesterCard";
import { useToast } from "../components/Toast";

const DashboardPage: React.FC = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
      return;
    }
    fetchSemesters();
  }, [token, user]);

  const totals = useMemo(() => {
    const disciplinesCount = semesters.reduce(
      (acc, cur) => acc + (cur.disciplines?.length || 0),
      0
    );
    const approved = semesters.filter((s) => s.approved === true).length;
    const reproved = semesters.filter((s) => s.approved === false).length;
    return { disciplinesCount, approved, reproved };
  }, [semesters]);

  async function fetchSemesters() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/grades");
      setSemesters(data as Semester[]);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar semestres");
      showToast(err.message || "Erro ao carregar semestres", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(semester: Semester) {
    navigate(`/semestres?edit=${semester._id}`);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Tem certeza que deseja remover este semestre?")) return;
    try {
      await apiFetch(`/grades/${id}`, {
        method: "DELETE"
      });
      showToast("Semestre removido com sucesso!", "success");
      await fetchSemesters();
    } catch (err: any) {
      const msg = err.message || "Erro ao excluir semestre";
      setError(msg);
      showToast(msg, "error");
    }
  }

  function exportPdf() {
    window.print();
  }

  return (
    <Layout>
      <div className="space-y-6 print-area">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 no-print">
          <div>
            <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
            <p className="text-sm text-slate-400">
              Histórico completo dos semestres registrados. Edições e novos cadastros
              são feitos na página de lançamento.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate("/semestres")}
              className="px-4 py-2 rounded-md border border-emerald-500 text-emerald-300 hover:bg-emerald-500/10 transition text-sm"
            >
              Lançar / editar semestre
            </button>
            <button
              type="button"
              onClick={exportPdf}
              className="px-4 py-2 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800 transition text-sm"
            >
              Exportar PDF
            </button>
          </div>
        </div>

        <section className="grid gap-3 sm:grid-cols-3 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">Semestres aprovados</p>
            <p className="text-2xl text-emerald-300 font-semibold">{totals.approved}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">Semestres reprovados</p>
            <p className="text-2xl text-rose-300 font-semibold">{totals.reproved}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">Disciplinas registradas</p>
            <p className="text-2xl text-white font-semibold">{totals.disciplinesCount}</p>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Histórico de semestres</h2>
            <p className="text-xs text-slate-500 no-print">
              Cadastro e atualização de notas/faltas acontecem na página intermediária.
            </p>
          </div>
          {error && (
            <div className="text-xs text-rose-300 no-print">Erro: {error}</div>
          )}
          {loading ? (
            <p className="text-slate-400 text-sm">Carregando...</p>
          ) : semesters.length === 0 ? (
            <p className="text-slate-400 text-sm">
              Nenhum semestre cadastrado ainda. Lance o primeiro na página de cadastro.
            </p>
          ) : (
            <div className="grid md:grid-cols-1 gap-4">
              {semesters.map((semester) => (
                <SemesterCard
                  key={semester._id}
                  semester={semester}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default DashboardPage;
