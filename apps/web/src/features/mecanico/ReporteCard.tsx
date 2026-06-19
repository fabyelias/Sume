import { CheckCheck, Clock3, ImageIcon } from "lucide-react";
import { useState } from "react";
import { api } from "../../lib/api";
import { card } from "../../lib/theme";
import type { EstadoReporte, Reporte } from "../../types";

const CATEGORIA_LABEL: Record<string, string> = { mecanica: "Mecánica", medicacion: "Medicación / insumos", otro: "Otro" };
const ESTADO_LABEL: Record<EstadoReporte, { label: string; cls: string }> = {
  abierto: { label: "Abierto", cls: "bg-rose-50 text-rose-600 border-rose-200" },
  en_proceso: { label: "En proceso", cls: "bg-amber-50 text-amber-600 border-amber-200" },
  resuelto: { label: "Resuelto", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
};

export function ReporteCard({ reporte, onUpdated }: { reporte: Reporte; onUpdated: (r: Reporte) => void }) {
  const [respuesta, setRespuesta] = useState(reporte.respuesta ?? "");
  const [enviando, setEnviando] = useState(false);
  const est = ESTADO_LABEL[reporte.estado];

  const responder = async (estado: EstadoReporte) => {
    if (!respuesta.trim()) return;
    setEnviando(true);
    const actualizado = await api.responderReporte(reporte.id, { estado, respuesta: respuesta.trim(), respondidoPor: "Taller" });
    onUpdated(actualizado);
    setEnviando(false);
  };

  return (
    <div className={`${card} p-4 space-y-2`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{CATEGORIA_LABEL[reporte.categoria]}</p>
          <p className="text-sm text-slate-700 mt-0.5">{reporte.texto}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Móvil {reporte.movilId} · {reporte.autor} · {new Date(reporte.createdAt).toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            {reporte.foto && (
              <span className="inline-flex items-center gap-1 ml-1">
                · <ImageIcon size={11} /> con foto
              </span>
            )}
          </p>
        </div>
        <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border shrink-0 ${est.cls}`}>{est.label}</span>
      </div>

      {reporte.respuesta && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600 mb-0.5">{reporte.respondidoPor || "Taller"}</p>
          <p className="text-sm text-slate-700">{reporte.respuesta}</p>
        </div>
      )}

      {reporte.estado !== "resuelto" && (
        <div className="space-y-2 pt-1">
          <textarea
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder="Ej: se llevó a la gomería, se reparó, se repuso el insumo..."
            rows={2}
            className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <div className="flex gap-2">
            <button
              onClick={() => responder("en_proceso")}
              disabled={!respuesta.trim() || enviando}
              className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide rounded-lg px-3 py-2.5 border ${respuesta.trim() ? "border-amber-300 text-amber-600 hover:bg-amber-50" : "border-slate-200 text-slate-300 cursor-not-allowed"}`}
            >
              <Clock3 size={14} /> En proceso
            </button>
            <button
              onClick={() => responder("resuelto")}
              disabled={!respuesta.trim() || enviando}
              className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide rounded-lg px-3 py-2.5 border ${respuesta.trim() ? "border-emerald-300 text-emerald-600 hover:bg-emerald-50" : "border-slate-200 text-slate-300 cursor-not-allowed"}`}
            >
              <CheckCheck size={14} /> Resuelto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
