import { CheckCheck, Clock3, ImageIcon } from "lucide-react";
import { useState } from "react";
import type { ChecklistItemMec, EstadoTicket } from "./types";

const ESTADOS: Record<EstadoTicket, { l: string; c: string }> = {
  abierto: { l: "Abierto", c: "bg-rose-50 text-rose-600 border-rose-200" },
  en_proceso: { l: "En proceso", c: "bg-amber-50 text-amber-600 border-amber-200" },
  resuelto: { l: "Resuelto", c: "bg-emerald-50 text-emerald-600 border-emerald-200" },
};

export function BitacoraTicket({ ticket, onUpdate }: { ticket: ChecklistItemMec; onUpdate: (t: ChecklistItemMec) => void }) {
  const [respuesta, setRespuesta] = useState("");
  const est = ESTADOS[ticket.estado ?? "abierto"];
  const bitacora = ticket.bitacora ?? [];

  const enviar = (nuevoEstado: EstadoTicket) => {
    if (!respuesta.trim()) return;
    onUpdate({ ...ticket, estado: nuevoEstado, bitacora: [...bitacora, { autor: "Taller", rol: "mec", hora: "Ahora", texto: respuesta.trim(), foto: false }] });
    setRespuesta("");
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="space-y-1.5">
        {bitacora.map((b, i) => (
          <div key={i} className={`rounded-lg p-2.5 text-sm ${b.rol === "mec" ? "bg-blue-50 border border-blue-100" : "bg-white border border-slate-100"}`}>
            <div className="flex items-center justify-between mb-0.5">
              <span className={`text-[11px] font-bold uppercase tracking-wide ${b.rol === "mec" ? "text-blue-600" : "text-slate-500"}`}>{b.rol === "mec" ? "Taller / Mecánico" : b.autor}</span>
              <span className="text-[11px] text-slate-400">{b.hora}</span>
            </div>
            <p className="text-slate-700">{b.texto}</p>
            {b.foto && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <ImageIcon size={12} /> Foto adjunta
              </div>
            )}
          </div>
        ))}
      </div>
      <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border inline-block ${est.c}`}>{est.l}</span>
      {ticket.estado !== "resuelto" && (
        <div className="space-y-2 pt-1">
          <textarea
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder="Ej: se llevó a la gomería, se reparó..."
            rows={2}
            className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <div className="flex gap-2">
            <button
              onClick={() => enviar("en_proceso")}
              disabled={!respuesta.trim()}
              className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide rounded-lg px-3 py-2.5 border ${respuesta.trim() ? "border-amber-300 text-amber-600 hover:bg-amber-50" : "border-slate-200 text-slate-300 cursor-not-allowed"}`}
            >
              <Clock3 size={14} /> En proceso
            </button>
            <button
              onClick={() => enviar("resuelto")}
              disabled={!respuesta.trim()}
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
