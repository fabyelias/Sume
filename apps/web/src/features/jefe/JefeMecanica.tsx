import { Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { SecTitle } from "../../components/shared/SecTitle";
import { api } from "../../lib/api";
import { A, R, card } from "../../lib/theme";
import type { Reporte } from "../../types";

const CATEGORIA_LABEL: Record<string, string> = { mecanica: "Mecánica", medicacion: "Medicación / insumos", otro: "Otro" };
const ESTADO_LABEL: Record<string, { label: string; cls: string }> = {
  abierto: { label: "Pendiente", cls: "bg-rose-50 text-rose-600 border-rose-200" },
  en_proceso: { label: "En proceso", cls: "bg-amber-50 text-amber-600 border-amber-200" },
  resuelto: { label: "Resuelto", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
};

export function JefeMecanica() {
  const [reportes, setReportes] = useState<Reporte[]>([]);

  useEffect(() => {
    const load = () => api.reportes().then(setReportes);
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, []);

  const pendientes = reportes.filter((r) => r.estado !== "resuelto");
  const resueltos = reportes.filter((r) => r.estado === "resuelto");

  return (
    <div className="space-y-4">
      <SecTitle icon={<Wrench size={13} />}>Reportes en vivo</SecTitle>
      {reportes.length === 0 && <div className={`${card} p-6 text-center text-sm text-slate-400`}>Sin reportes mecánicos pendientes.</div>}

      {[...pendientes, ...resueltos].map((r) => {
        const est = ESTADO_LABEL[r.estado];
        return (
          <div key={r.id} className={`${card} p-4`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg shrink-0 ${r.estado === "resuelto" ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>
                  <Wrench size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-700">{r.texto}</p>
                  <p className="text-xs text-slate-400">
                    Móvil <span style={{ color: R }} className="font-semibold">{r.movilId}</span> · {CATEGORIA_LABEL[r.categoria]} · {r.autor} · {new Date(r.createdAt).toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    {r.foto && " · con foto"}
                  </p>
                </div>
              </div>
              <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border shrink-0 ${est.cls}`}>{est.label}</span>
            </div>
            {r.respuesta && (
              <div className="mt-2 ml-11 rounded-lg p-2.5" style={{ background: `${A}0D` }}>
                <p className="text-[11px] font-bold uppercase tracking-wide mb-0.5" style={{ color: A }}>
                  Respuesta de {r.respondidoPor || "Taller"}
                </p>
                <p className="text-sm text-slate-700">{r.respuesta}</p>
              </div>
            )}
          </div>
        );
      })}
      <p className="text-xs text-slate-400 text-center pt-2">Para responder y marcar como resuelto, entrá con el perfil Mecánico / Farmacia.</p>
    </div>
  );
}
