import { Camera, CheckCircle2, Lock, XCircle } from "lucide-react";
import type { ReactNode } from "react";

export type DetallePM = { texto: string; foto: boolean };

export function ChecklistItemPM({
  label,
  icon,
  ok,
  onToggle,
  detalle,
  onDetalleChange,
  placeholder,
  locked,
}: {
  label: string;
  icon: ReactNode;
  ok: boolean;
  onToggle: () => void;
  detalle: DetallePM;
  onDetalleChange: (val: DetallePM) => void;
  placeholder: string;
  locked: boolean;
}) {
  return (
    <div className={`rounded-xl border transition-all overflow-hidden ${ok ? "border-emerald-200 bg-emerald-50/60" : "border-rose-200 bg-rose-50/60"} ${locked ? "opacity-80" : ""}`}>
      <button onClick={onToggle} disabled={locked} className={`w-full flex items-center justify-between p-3.5 text-left ${locked ? "cursor-default" : ""}`}>
        <span className="flex items-center gap-3 text-sm text-slate-700">
          {icon}
          {label}
        </span>
        <span className="flex items-center gap-2">
          {locked && <Lock size={12} className="text-slate-400" />}
          {ok ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-rose-500" />}
        </span>
      </button>
      {!ok && (
        <div className="px-3.5 pb-3.5 space-y-2">
          <textarea
            value={detalle.texto}
            onChange={(e) => onDetalleChange({ ...detalle, texto: e.target.value })}
            placeholder={placeholder}
            rows={2}
            disabled={locked}
            className={`w-full rounded-lg border border-rose-200 p-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200 ${locked ? "bg-rose-50/40" : "bg-white"}`}
          />
          <button
            onClick={() => !locked && onDetalleChange({ ...detalle, foto: !detalle.foto })}
            disabled={locked}
            className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 w-full justify-center border transition-colors
              ${detalle.foto ? "border-rose-300 bg-rose-100 text-rose-700" : "border-dashed border-rose-300 text-rose-500 hover:bg-rose-50"} ${locked ? "cursor-default opacity-90" : ""}`}
          >
            <Camera size={15} /> {detalle.foto ? "Foto adjuntada ✓" : "Adjuntar foto (obligatorio)"}
          </button>
          {!locked && (!detalle.texto || !detalle.foto) && <p className="text-[11px] text-rose-500">Completá la descripción y adjuntá una foto para poder enviar.</p>}
        </div>
      )}
    </div>
  );
}
