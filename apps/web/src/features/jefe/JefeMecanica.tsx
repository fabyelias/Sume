import { Wrench } from "lucide-react";
import { SecTitle } from "../../components/shared/SecTitle";
import { card } from "../../lib/theme";

type Incidencia = { movil: string; item: string; prio: "alta" | "media"; por: string; hora: string; foto: boolean };

// Sin reportes todavía: se va a completar con los que carguen los
// paramédicos/mecánicos durante el uso real.
const INCID: Incidencia[] = [];

export function JefeMecanica() {
  return (
    <div className="space-y-4">
      <SecTitle icon={<Wrench size={13} />}>Reportes mecánicos</SecTitle>
      {INCID.length === 0 && <div className={`${card} p-6 text-center text-sm text-slate-400`}>Sin reportes mecánicos pendientes.</div>}
      {INCID.map((i, idx) => (
        <div key={idx} className={`${card} p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${i.prio === "alta" ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500"}`}>
              <Wrench size={16} />
            </div>
            <div>
              <p className="text-sm text-slate-700">{i.item}</p>
              <p className="text-xs text-slate-400">
                Móvil {i.movil} · {i.por} · {i.hora} {i.foto && "· con foto"}
              </p>
            </div>
          </div>
          <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border ${i.prio === "alta" ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
            {i.prio === "alta" ? "Alta" : "Media"}
          </span>
        </div>
      ))}
      <p className="text-xs text-slate-400 text-center pt-2">Para la bitácora completa con tickets y stock, entrá con el perfil Mecánico / Farmacia.</p>
    </div>
  );
}
