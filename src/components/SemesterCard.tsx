import React from "react";

export interface Discipline {
  _id?: string;
  name: string;
  workload: number;
  absences: number;
  av1?: number | null;
  av2?: number | null;
  av3?: number | null;
  edag?: number | null;
  average?: number | null;
  status?: string | null;
  limitAbsences?: number | null;
  requiredScore?: number | null;
  maxAchievable?: number | null;
  missingAssessments?: string[];
}

export interface Semester {
  _id: string;
  year: number;
  term: number;
  disciplines: Discipline[];
  average?: number | null;
  approved?: boolean | null;
}

interface Props {
  semester: Semester;
  onEdit: (semester: Semester) => void;
  onDelete: (id: string) => void;
}

function formatGrade(value?: number | null) {
  return typeof value === "number" && !Number.isNaN(value) ? value.toFixed(1) : "—";
}

function formatStatus(status?: string | null) {
  switch (status) {
    case "APROVADO":
      return { label: "Aprovado", className: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" };
    case "REPROVADO_NOTA":
      return { label: "Reprovado por nota", className: "bg-rose-500/20 text-rose-300 border border-rose-500/40" };
    case "REPROVADO_FALTA":
      return { label: "Reprovado por falta", className: "bg-rose-700/30 text-rose-200 border border-rose-500/50" };
    case "EM_RISCO":
      return { label: "Em risco", className: "bg-amber-500/20 text-amber-200 border border-amber-500/40" };
    default:
      return { label: "Em andamento", className: "bg-slate-700 text-slate-200 border border-slate-600" };
  }
}

const SemesterCard: React.FC<Props> = ({ semester, onEdit, onDelete }) => {
  const statusLabel =
    semester.approved === null || semester.approved === undefined
      ? "Pendente"
      : semester.approved
      ? "Aprovado"
      : "Reprovado";

  const statusClasses =
    semester.approved === null || semester.approved === undefined
      ? "bg-slate-700 text-slate-200 border border-slate-600"
      : semester.approved
      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
      : "bg-rose-500/20 text-rose-300 border border-rose-500/40";

  const averageText =
    typeof semester.average === "number" && !Number.isNaN(semester.average)
      ? semester.average.toFixed(2)
      : "Pendente";

  const disciplines = semester.disciplines || [];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-100">
          {semester.year}.{semester.term}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClasses}`}>
            {statusLabel}
          </span>
          <div className="flex gap-2 no-print">
            <button
              onClick={() => onEdit(semester)}
              className="px-2 py-1 text-xs rounded-md bg-slate-700 hover:bg-slate-600 text-slate-100"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(semester._id)}
              className="px-2 py-1 text-xs rounded-md bg-rose-600/80 hover:bg-rose-600 text-white"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">
          Média geral: <strong className="text-slate-100">{averageText}</strong>
        </span>
        <span className="text-slate-400 text-xs">
          {disciplines.length} disciplina(s)
        </span>
      </div>

      <div className="space-y-2">
        {disciplines.map((disc) => {
          const status = formatStatus(disc.status);
          const absencesValue =
            disc.absences !== undefined && disc.absences !== null ? disc.absences : 0;
          const absencesInfo =
            disc.limitAbsences !== null && disc.limitAbsences !== undefined
              ? `${absencesValue}/${disc.limitAbsences}`
              : `${absencesValue}`;

          return (
            <div
              key={disc._id || disc.name}
              className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-xs text-slate-300"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-sm text-slate-100 font-semibold">{disc.name}</span>
                  <span className="text-slate-500">
                    Carga horária: {disc.workload}h · Faltas: {absencesInfo}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full font-semibold ${status.className}`}>
                  {status.label}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                <span>
                  Média: <strong className="text-slate-100">{formatGrade(disc.average)}</strong>
                </span>
                <span>
                  AV1: <strong className="text-slate-100">{formatGrade(disc.av1)}</strong>
                </span>
                <span>
                  AV2: <strong className="text-slate-100">{formatGrade(disc.av2)}</strong>
                </span>
                <span>
                  AV3: <strong className="text-slate-100">{formatGrade(disc.av3)}</strong>
                </span>
                <span>
                  EDAG: <strong className="text-slate-100">{formatGrade(disc.edag)}</strong>
                </span>
                <span>
                  Limite de faltas:{" "}
                  <strong className="text-slate-100">
                    {disc.limitAbsences !== undefined && disc.limitAbsences !== null
                      ? disc.limitAbsences
                      : "—"}
                  </strong>
                </span>
                <span className="col-span-2 md:col-span-4 text-slate-400">
                  {disc.requiredScore !== null && disc.requiredScore !== undefined ? (
                    disc.requiredScore <= 10 ? (
                      <>
                        Precisa de pelo menos{" "}
                        <strong className="text-emerald-200">
                          {disc.requiredScore.toFixed(2)}
                        </strong>{" "}
                        de média nas avaliações restantes.
                      </>
                    ) : (
                      <>
                        Mesmo com notas máximas, a média ficaria{" "}
                        <strong className="text-rose-200">
                          {disc.maxAchievable?.toFixed(2) ?? "—"}
                        </strong>
                        .
                      </>
                    )
                  ) : (
                    "Todas as avaliações preenchidas."
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SemesterCard;
