import React, { useContext, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../services/api";
import { useToast } from "../components/Toast";
import { Discipline, Semester } from "../components/SemesterCard";

type GradeKey = "av1" | "av2" | "av3" | "edag";
type DisciplineStatus =
  | "APROVADO"
  | "REPROVADO_NOTA"
  | "REPROVADO_FALTA"
  | "EM_RISCO"
  | "EM_ANDAMENTO";

type DisciplineForm = {
  id: string;
  name: string;
  workload: string;
  absences: string;
  av1: string;
  av2: string;
  av3: string;
  edag: string;
};

type EvaluatedDiscipline = Discipline & { status: DisciplineStatus };

const gradeWeights: Record<GradeKey, number> = {
  av1: 0.25,
  av2: 0.25,
  av3: 0.3,
  edag: 0.2
};

const buildId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const emptyDiscipline = (): DisciplineForm => ({
  id: buildId(),
  name: "",
  workload: "",
  absences: "",
  av1: "",
  av2: "",
  av3: "",
  edag: ""
});

function toNumberOrNull(value: string): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function sanitizeDiscipline(form: DisciplineForm) {
  return {
    name: form.name.trim(),
    workload: Number(form.workload || 0),
    absences: Number(form.absences || 0),
    av1: toNumberOrNull(form.av1),
    av2: toNumberOrNull(form.av2),
    av3: toNumberOrNull(form.av3),
    edag: toNumberOrNull(form.edag)
  };
}

function evaluateDiscipline(input: ReturnType<typeof sanitizeDiscipline>): EvaluatedDiscipline {
  const missingAssessments: string[] = [];
  let weightedSum = 0;
  let filledWeight = 0;

  (Object.keys(gradeWeights) as GradeKey[]).forEach((key) => {
    const grade = input[key];
    const weight = gradeWeights[key];
    if (typeof grade === "number" && !Number.isNaN(grade)) {
      weightedSum += grade * weight;
      filledWeight += weight;
    } else {
      missingAssessments.push(key.toUpperCase());
    }
  });

  const missingWeight = 1 - filledWeight;
  const hasAllGrades = missingWeight <= 0;
  const average = hasAllGrades ? Number(weightedSum.toFixed(2)) : null;
  const limitAbsences = Number((input.workload * 0.25).toFixed(2));
  const maxAchievable = Number(
    (weightedSum + Math.max(missingWeight, 0) * 10).toFixed(2)
  );

  const requiredScore =
    missingWeight > 0
      ? Number(Math.max(0, (7 - weightedSum) / missingWeight).toFixed(2))
      : null;

  const absenceRisk = input.absences >= limitAbsences * 0.8;
  const reprovFalta = input.absences > limitAbsences;
  const partialAverage =
    filledWeight > 0 ? Number((weightedSum / filledWeight).toFixed(2)) : null;

  let status: DisciplineStatus = "EM_ANDAMENTO";

  if (reprovFalta) {
    status = "REPROVADO_FALTA";
  } else if (average !== null) {
    status = average >= 7 ? "APROVADO" : "REPROVADO_NOTA";
  } else {
    const riskNota =
      (requiredScore !== null && requiredScore >= 7) ||
      (partialAverage !== null && partialAverage < 7);
    if (absenceRisk || riskNota) {
      status = "EM_RISCO";
    }
  }

  return {
    ...input,
    average,
    status,
    requiredScore,
    maxAchievable,
    missingAssessments,
    limitAbsences
  };
}

function evaluateSemester(forms: DisciplineForm[]) {
  const sanitized = forms.map(sanitizeDiscipline);
  const evaluated = sanitized.map(evaluateDiscipline);
  const averages = evaluated.filter((d) => d.average !== null);
  const totalWorkload = averages.reduce((acc, cur) => acc + cur.workload, 0);
  const weightedAverage =
    totalWorkload > 0
      ? averages.reduce((acc, cur) => acc + (cur.average as number) * cur.workload, 0) /
        totalWorkload
      : null;

  const average =
    weightedAverage !== null && !Number.isNaN(weightedAverage)
      ? Number(weightedAverage.toFixed(2))
      : null;

  const hasReprovFalta = evaluated.some((d) => d.status === "REPROVADO_FALTA");
  const hasReprovNota = evaluated.some((d) => d.status === "REPROVADO_NOTA");
  const allApproved = evaluated.length > 0 && evaluated.every((d) => d.status === "APROVADO");

  let approved: boolean | null = null;
  if (allApproved) approved = true;
  else if (hasReprovFalta || hasReprovNota) approved = false;

  return { evaluated, average, approved, sanitized };
}

const SemesterEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState<number>(currentYear);
  const [term, setTerm] = useState<number>(1);
  const [disciplines, setDisciplines] = useState<DisciplineForm[]>([emptyDiscipline()]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const evaluation = useMemo(() => evaluateSemester(disciplines), [disciplines]);

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId && semesters.length > 0) {
      const found = semesters.find((s) => s._id === editId);
      if (found) {
        loadSemester(found);
      }
    }
  }, [searchParams, semesters]);

  function addDiscipline() {
    setDisciplines((prev) => [...prev, emptyDiscipline()]);
  }

  function updateDiscipline(id: string, field: keyof DisciplineForm, value: string) {
    setHasSaved(false);
    setDisciplines((prev) =>
      prev.map((disc) => (disc.id === id ? { ...disc, [field]: value } : disc))
    );
  }

  function removeDiscipline(id: string) {
    setHasSaved(false);
    setDisciplines((prev) => (prev.length === 1 ? prev : prev.filter((d) => d.id !== id)));
  }

  function loadSemester(semester: Semester) {
    setYear(semester.year);
    setTerm(semester.term);
    setEditingId(semester._id);
    const list = semester.disciplines && semester.disciplines.length > 0
      ? semester.disciplines
      : [];
    setDisciplines(
      (list.length ? list : [emptyDiscipline()]).map((disc) => ({
        id: buildId(),
        name: disc.name || "",
        workload: disc.workload ? String(disc.workload) : "",
        absences:
          disc.absences !== undefined && disc.absences !== null
            ? String(disc.absences)
            : "",
        av1: disc.av1 !== undefined && disc.av1 !== null ? String(disc.av1) : "",
        av2: disc.av2 !== undefined && disc.av2 !== null ? String(disc.av2) : "",
        av3: disc.av3 !== undefined && disc.av3 !== null ? String(disc.av3) : "",
        edag: disc.edag !== undefined && disc.edag !== null ? String(disc.edag) : ""
      }))
    );
    setHasSaved(false);
  }

  async function fetchSemesters() {
    setLoadingSemesters(true);
    try {
      const data = await apiFetch("/grades");
      setSemesters(data as Semester[]);
    } catch (err: any) {
      showToast(err.message || "Erro ao carregar semestres", "error");
    } finally {
      setLoadingSemesters(false);
    }
  }

  function validateDisciplines() {
    for (const disc of disciplines) {
      if (!disc.name.trim()) {
        showToast("Informe o nome de todas as disciplinas.", "error");
        return false;
      }
      if (!disc.workload || Number(disc.workload) <= 0) {
        showToast("Informe a carga horária de todas as disciplinas.", "error");
        return false;
      }
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateDisciplines()) return;

    setSaving(true);
    setHasSaved(false);

    const payload = {
      year,
      term,
      disciplines: disciplines.map(sanitizeDiscipline)
    };

    try {
      const response = await apiFetch(editingId ? `/grades/${editingId}` : "/grades", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      const saved = response as Semester;
      setEditingId(saved._id || editingId);
      showToast(editingId ? "Semestre atualizado!" : "Semestre criado!", "success");
      setHasSaved(true);
      await fetchSemesters();
    } catch (err: any) {
      showToast(err.message || "Erro ao salvar semestre", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 no-print">
          <div>
            <h1 className="text-2xl font-semibold text-white">Cadastro do semestre</h1>
            <p className="text-sm text-slate-400">
              Lance disciplinas, notas, faltas e acompanhe cálculos de média, risco e
              limite de faltas antes de ir ao dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-sm rounded-md border border-slate-700 text-slate-100 hover:bg-slate-800 transition"
            >
              Ir para o dashboard
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-5 print-area"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex gap-3">
              <div className="flex flex-col">
                <label className="text-sm text-slate-300">Ano</label>
                <input
                  type="number"
                  min={2000}
                  max={2100}
                  className="rounded-md px-3 py-2 bg-slate-800 text-white outline-none focus:ring-2 focus:ring-emerald-400"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-slate-300">Semestre</label>
                <select
                  className="rounded-md px-3 py-2 bg-slate-800 text-white outline-none focus:ring-2 focus:ring-emerald-400"
                  value={term}
                  onChange={(e) => setTerm(Number(e.target.value))}
                >
                  <option value={1}>1º</option>
                  <option value={2}>2º</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={addDiscipline}
                className="px-4 py-2 rounded-md border border-slate-700 text-slate-100 hover:bg-slate-800 transition no-print"
              >
                Adicionar disciplina
              </button>
              {loadingSemesters ? (
                <span className="text-xs text-slate-400">Carregando semestres...</span>
              ) : (
                semesters.length > 0 && (
                  <select
                    className="rounded-md px-3 py-2 bg-slate-800 text-white outline-none focus:ring-2 focus:ring-emerald-400 no-print"
                    value={editingId ?? ""}
                    onChange={(e) => {
                      const selected = semesters.find((s) => s._id === e.target.value);
                      if (selected) loadSemester(selected);
                    }}
                  >
                    <option value="">Criar novo semestre</option>
                    {semesters.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.year}.{s.term}
                      </option>
                    ))}
                  </select>
                )
              )}
            </div>
          </div>

          <div className="space-y-4">
            {disciplines.map((disc, index) => {
              const evaluated = evaluation.evaluated[index];
              const required =
                evaluated?.requiredScore !== null && evaluated?.requiredScore !== undefined
                  ? evaluated.requiredScore
                  : null;
              const maxAchievable = evaluated?.maxAchievable ?? null;

              return (
                <div
                  key={disc.id}
                  className="border border-slate-800 rounded-xl p-4 bg-slate-800/60"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        Disciplina #{index + 1}
                      </span>
                      {evaluated?.status && (
                        <span className="text-xs px-2 py-1 rounded-full border border-slate-600 text-slate-200">
                          {evaluated.status === "APROVADO"
                            ? "Aprovado"
                            : evaluated.status === "REPROVADO_NOTA"
                            ? "Reprovado por nota"
                            : evaluated.status === "REPROVADO_FALTA"
                            ? "Reprovado por falta"
                            : evaluated.status === "EM_RISCO"
                            ? "Em risco"
                            : "Em andamento"}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDiscipline(disc.id)}
                      className="text-xs px-2 py-1 rounded-md border border-rose-600 text-rose-200 hover:bg-rose-600/10 transition no-print"
                    >
                      Remover
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-200">Nome da disciplina</label>
                      <input
                        type="text"
                        value={disc.name}
                        onChange={(e) => updateDiscipline(disc.id, "name", e.target.value)}
                        className="rounded-md px-3 py-2 bg-slate-900 text-white outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="Ex.: Cálculo I"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-200">Carga horária (h)</label>
                      <input
                        type="number"
                        min={1}
                        value={disc.workload}
                        onChange={(e) =>
                          updateDiscipline(disc.id, "workload", e.target.value)
                        }
                        className="rounded-md px-3 py-2 bg-slate-900 text-white outline-none focus:ring-2 focus:ring-emerald-400"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-200">Faltas acumuladas</label>
                      <input
                        type="number"
                        min={0}
                        value={disc.absences}
                        onChange={(e) =>
                          updateDiscipline(disc.id, "absences", e.target.value)
                        }
                        className="rounded-md px-3 py-2 bg-slate-900 text-white outline-none focus:ring-2 focus:ring-emerald-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                    {(Object.keys(gradeWeights) as GradeKey[]).map((key) => (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="text-slate-200 uppercase">
                          {key} · peso {Math.round(gradeWeights[key] * 100)}%
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          max={10}
                          value={disc[key]}
                          onChange={(e) => updateDiscipline(disc.id, key, e.target.value)}
                          className="rounded-md px-3 py-2 bg-slate-900 text-white outline-none focus:ring-2 focus:ring-emerald-400"
                          placeholder="Opcional"
                        />
                      </div>
                    ))}
                  </div>

                  {evaluated && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-300">
                      <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
                        <p className="text-xs text-slate-400">Média final</p>
                        <p className="text-xl text-white font-semibold">
                          {evaluated.average !== null ? evaluated.average.toFixed(2) : "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Calculada quando todas as notas estiverem preenchidas.
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
                        <p className="text-xs text-slate-400">Faltas</p>
                        <p className="text-sm text-white font-semibold">
                          {evaluated.absences} / {evaluated.limitAbsences}
                        </p>
                        <p className="text-xs text-slate-500">
                          Limite de faltas: 25% da carga horária.
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
                        <p className="text-xs text-slate-400">Notas restantes</p>
                        <p className="text-sm text-white font-semibold">
                          {evaluated.missingAssessments?.length
                            ? evaluated.missingAssessments.join(", ")
                            : "Nenhuma pendente"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {required !== null ? (
                            required <= 10 ? (
                              <>
                                Precisa de média mínima de{" "}
                                <strong className="text-emerald-300">
                                  {required.toFixed(2)}
                                </strong>{" "}
                                nas provas restantes.
                              </>
                            ) : (
                              <>
                                Mesmo com notas máximas a média fica{" "}
                                <strong className="text-rose-300">
                                  {maxAchievable?.toFixed(2) ?? "—"}
                                </strong>
                                .
                              </>
                            )
                          ) : (
                            "Todas as notas lançadas."
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-sm text-slate-200">
                Média geral do semestre:{" "}
                <strong className="text-white">
                  {evaluation.average !== null ? evaluation.average.toFixed(2) : "—"}
                </strong>
              </span>
              <span className="text-xs text-slate-400">
                {evaluation.approved === null
                  ? "Em andamento."
                  : evaluation.approved
                  ? "Aprovado em todas as disciplinas."
                  : "Há reprovações por nota ou falta."}
              </span>
            </div>
            <div className="flex gap-3 no-print">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition disabled:opacity-60"
              >
                {saving
                  ? "Salvando..."
                  : editingId
                  ? "Atualizar semestre"
                  : "Salvar semestre"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
              >
                Ir para o dashboard
              </button>
            </div>
          </div>

          {hasSaved && (
            <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-semibold">Semestre salvo com sucesso.</p>
                <p className="text-sm">
                  Você pode seguir para o dashboard para acompanhar o histórico ou
                  continuar editando aqui.
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold transition"
              >
                Ver dashboard
              </button>
            </div>
          )}
        </form>

        {user && (
          <div className="text-xs text-slate-500 no-print">
            Usuário autenticado: <span className="text-slate-300">{user.email}</span>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SemesterEntryPage;
