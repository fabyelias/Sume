import { ChevronRight, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { SecTitle } from "../../components/shared/SecTitle";
import { HOY, MOVILES_FIS } from "../../data/constants";
import { api } from "../../lib/api";
import { A, R, card, grad } from "../../lib/theme";
import type { Asignacion, Base } from "../../types";

export function PMSeleccion({
  nombreParamedico,
  onConfirmar,
}: {
  nombreParamedico: string;
  onConfirmar: (g: { base: Base; movilFisico: string }) => void;
}) {
  const [bases, setBases] = useState<Base[]>([]);
  const [baseId, setBaseId] = useState<string | null>(null);
  const [movilFisico, setMovilFisico] = useState<string | null>(null);
  const [asignacionJefe, setAsignacionJefe] = useState<Asignacion | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setBases(await api.bases());
      const todas = await api.getAsignaciones();
      if (todas[`${HOY}:${nombreParamedico}`]) {
        const a = todas[`${HOY}:${nombreParamedico}`];
        setAsignacionJefe(a);
        setBaseId(a.baseId);
        setMovilFisico(a.movil);
      }
      setCargando(false);
    };
    cargar();
  }, [nombreParamedico]);

  const base = bases.find((b) => b.id === baseId);
  const puedeConfirmar = baseId && movilFisico;

  return (
    <div className="space-y-7">
      {cargando ? (
        <div className={`${card} p-6 text-center text-slate-400 text-sm`}>Cargando asignación...</div>
      ) : asignacionJefe ? (
        <div className="space-y-4">
          <div className={`${card} p-5 border-l-4`} style={{ borderLeftColor: A }}>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-semibold mb-3">Asignación del Jefe de Paramédicos</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-400 mb-0.5">Base</p>
                <p className="font-semibold text-slate-800">{asignacionJefe.base}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-400 mb-0.5">Móvil asignado</p>
                <p className="font-display text-xl font-semibold" style={{ color: R }}>
                  {asignacionJefe.movil}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 col-span-2">
                <p className="text-xs text-slate-400 mb-0.5">Turno</p>
                <p className="font-semibold text-slate-800">{asignacionJefe.turno}</p>
              </div>
            </div>
          </div>
          <button onClick={() => setAsignacionJefe(null)} className="w-full py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">
            Cambiar manualmente
          </button>
        </div>
      ) : (
        <>
          <section>
            <SecTitle icon={<MapPin size={13} />}>Paso 1 · Tu base asignada</SecTitle>
            <p className="text-sm text-slate-500 mt-2 mb-3">Seleccioná la base que te asignó el Jefe de Paramédicos.</p>
            <div className="grid grid-cols-2 gap-2">
              {bases.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setBaseId(b.id);
                    setMovilFisico(null);
                  }}
                  className={`rounded-xl border p-4 text-left transition-all ${baseId === b.id ? "border-transparent text-white" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  style={baseId === b.id ? { background: A } : {}}
                >
                  <p className={`font-display text-lg leading-tight ${baseId === b.id ? "text-white" : "text-slate-800"}`}>{b.label}</p>
                  <p className={`text-xs mt-1 ${baseId === b.id ? "text-blue-100" : "text-slate-400"}`}>{b.turno}</p>
                </button>
              ))}
            </div>
          </section>
          {baseId && (
            <section>
              <SecTitle icon={<ChevronRight size={13} />}>Paso 2 · Móvil físico del día</SecTitle>
              <p className="text-sm text-slate-500 mt-2 mb-3">
                Seleccioná el móvil con el que salís hoy en <strong>{base?.label}</strong>.
              </p>
              <div className="flex flex-wrap gap-2">
                {MOVILES_FIS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMovilFisico(m)}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${movilFisico === m ? "border-transparent text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
                    style={movilFisico === m ? { background: R } : {}}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {puedeConfirmar && (
        <div className={`${card} p-4 border-l-4`} style={{ borderLeftColor: A }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-semibold mb-2">Confirmá tu guardia</p>
          <p className="text-sm text-slate-700">
            Base: <span className="font-semibold text-slate-900">{base?.label}</span>
          </p>
          <p className="text-sm text-slate-700">
            Móvil: <span className="font-semibold" style={{ color: R }}>{movilFisico}</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Turno: {base?.turno}</p>
        </div>
      )}

      <button
        onClick={() => puedeConfirmar && base && onConfirmar({ base, movilFisico })}
        disabled={!puedeConfirmar}
        className={`w-full flex items-center justify-center gap-2 font-display uppercase tracking-[0.2em] text-sm py-4 rounded-xl transition-opacity ${puedeConfirmar ? "text-white hover:opacity-90" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
        style={puedeConfirmar ? { background: grad } : {}}
      >
        <ChevronRight size={16} /> {puedeConfirmar ? `Confirmar: ${base?.label} · Móvil ${movilFisico}` : "Seleccioná base y móvil"}
      </button>
    </div>
  );
}
