import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SecTitle } from "../../components/shared/SecTitle";
import { HOY, MOVILES_MED } from "../../data/constants";
import { api } from "../../lib/api";
import { A, R, card } from "../../lib/theme";
import type { ChecklistsPM, Medico, Movil, Presencias, Reporte } from "../../types";

export function JefeOperativos() {
  const [moviles, setMoviles] = useState<Movil[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [checklists, setChecklists] = useState<ChecklistsPM>({});
  const [presencias, setPresencias] = useState<Presencias>({});
  const [reportes, setReportes] = useState<Reporte[]>([]);

  useEffect(() => {
    const load = async () => {
      setChecklists(await api.getChecklistsPM());
      setPresencias(await api.getPresencias());
      setReportes(await api.reportes());
    };
    const loadCatalogo = async () => {
      setMoviles(await api.moviles());
      setMedicos(await api.medicos());
    };
    loadCatalogo();
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, []);

  // Mismo criterio que Panel Jefe → Dirección: el paramédico tiene que
  // haber enviado (no solo "estar asignado") el checklist de hoy para ese
  // móvil, y si el móvil lleva médico, que también haya fichado presente.
  const paramedicoDe = (movilId: string) => {
    const entry = Object.entries(checklists).find(([k, v]) => k.startsWith(`${HOY}:`) && v.movilFisico === movilId && v.enviado);
    return entry ? entry[0].slice(HOY.length + 1) : null;
  };

  const medicoDe = (movilId: string) => {
    const entry = Object.entries(presencias).find(([k, v]) => k.endsWith(`:${HOY}`) && v.movil === movilId && v.confirmado);
    if (!entry) return null;
    const medicoId = entry[0].split(":")[0];
    return medicos.find((m) => m.id === medicoId)?.nombre ?? "Médico";
  };

  const reportesAbiertosDe = (movilId: string) => reportes.filter((r) => r.movilId === movilId && r.estado !== "resuelto");

  const operativos = moviles.filter((m) => {
    const para = paramedicoDe(m.id);
    const med = medicoDe(m.id);
    return MOVILES_MED.includes(m.id) ? !!para && !!med : !!para;
  });

  return (
    <div className="space-y-4">
      <SecTitle icon={<CheckCircle2 size={13} />}>Móviles operativos ahora</SecTitle>
      <p className="text-sm text-slate-500">Solo los móviles con checklist del paramédico enviado y, cuando corresponde, presente del médico confirmado.</p>
      <div className="space-y-3">
        {operativos.length === 0 && <div className={`${card} p-6 text-center text-sm text-slate-400`}>Ningún móvil operativo todavía.</div>}
        {operativos.map((m) => {
          const para = paramedicoDe(m.id);
          const med = medicoDe(m.id);
          const abiertos = reportesAbiertosDe(m.id);
          return (
            <div key={m.id} className={`${card} p-4 flex items-center justify-between gap-3`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-display text-xl text-slate-800">
                    Móvil <span style={{ color: R }}>{m.id}</span> <span className="text-slate-400 text-base">· {m.nombre}</span>
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {para}
                    {med && <span style={{ color: A }}> · {med}</span>}
                  </p>
                </div>
              </div>
              {abiertos.length > 0 && (
                <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border bg-rose-50 text-rose-600 border-rose-200 flex items-center gap-1.5 shrink-0">
                  <AlertTriangle size={11} /> {abiertos.length} novedad{abiertos.length > 1 ? "es" : ""}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
