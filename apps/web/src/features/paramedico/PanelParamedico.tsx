import { ArrowLeft, Asterisk, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { HOY, SLOTS, type Slot } from "../../data/constants";
import { api } from "../../lib/api";
import { A, BG, R, card, fontImport } from "../../lib/theme";
import type { Asignaciones, Base, Paramedico } from "../../types";
import { PMChecklist } from "./PMChecklist";
import { PMSeleccion } from "./PMSeleccion";

type Guardia = { base: Base; movilFisico: string };

export function PanelParamedico({ onBack }: { onBack: () => void }) {
  const [paramedicos, setParamedicos] = useState<Paramedico[]>([]);
  const [asigHoy, setAsigHoy] = useState<Asignaciones>({});
  const [cargandoLista, setCargandoLista] = useState(true);
  const [nombre, setNombre] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [guardia, setGuardia] = useState<Guardia | null>(null);
  const [buscandoGuardia, setBuscandoGuardia] = useState(false);

  useEffect(() => {
    Promise.all([api.paramedicos(), api.getAsignaciones()]).then(([ps, a]) => {
      setParamedicos(ps);
      setAsigHoy(a);
      setCargandoLista(false);
    });
  }, []);

  const slotsDe = (n: string): Slot[] => SLOTS.map((s) => s.id).filter((s) => !!asigHoy[`${HOY}:${n}:${s}`]);

  // Si ya tiene un checklist enviado hoy para esa guardia puntual, salta
  // directo a él en vez de hacerlo elegir base/móvil de nuevo.
  useEffect(() => {
    if (!nombre || !slot) {
      setGuardia(null);
      return;
    }
    setBuscandoGuardia(true);
    api.getChecklistsPM().then((checklists) => {
      const rec = checklists[`${HOY}:${nombre}:${slot}`];
      setGuardia(rec ? { base: rec.base, movilFisico: rec.movilFisico } : null);
      setBuscandoGuardia(false);
    });
  }, [nombre, slot]);

  const elegirNombre = (n: string) => {
    setNombre(n);
    const slots = slotsDe(n);
    setSlot(slots.length === 1 ? slots[0] : null);
  };

  const volver = () => {
    if (guardia) {
      setGuardia(null);
      return;
    }
    if (slot && slotsDe(nombre ?? "").length > 1) {
      setSlot(null);
      return;
    }
    if (nombre) {
      setNombre(null);
      return;
    }
    onBack();
  };

  if (!nombre) {
    const disponibles = paramedicos.filter(({ nombre: n }) => slotsDe(n).length > 0);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: BG, fontFamily: "Inter, sans-serif" }}>
        <style>{fontImport}</style>
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <button onClick={onBack} className="absolute top-6 left-6 p-2 rounded-lg hover:bg-white transition-colors">
              <ArrowLeft size={20} className="text-slate-400" />
            </button>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: BG, border: `2px solid ${A}20` }}>
              <Asterisk size={32} style={{ color: A }} strokeWidth={2} />
            </div>
            <p className="font-display text-3xl">
              <span style={{ color: R }}>SUME</span> <span style={{ color: A }}>SALUD</span>
            </p>
            <p className="text-sm text-slate-400 mt-1">¿Quién toma guardia hoy?</p>
          </div>
          <div className="grid gap-2">
            {cargandoLista ? (
              <div className={`${card} p-6 text-center text-slate-400 text-sm`}>Cargando...</div>
            ) : disponibles.length === 0 ? (
              <div className={`${card} p-6 text-center text-slate-400 text-sm`}>Todavía nadie tiene una guardia asignada hoy. Hablá con el Jefe de Paramédicos.</div>
            ) : (
              disponibles.map(({ nombre: n }) => (
                <button key={n} onClick={() => elegirNombre(n)} className={`${card} p-4 text-left flex items-center gap-3 hover:border-blue-200 transition-colors`}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm text-white shrink-0" style={{ background: A }}>
                    {n.split(" ").map((x) => x[0]).join("").slice(0, 2)}
                  </div>
                  <p className="font-semibold text-slate-800">{n}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  const slotsDisponibles = slotsDe(nombre);

  return (
    <div className="min-h-screen" style={{ background: BG, fontFamily: "Inter, sans-serif" }}>
      <style>{fontImport}</style>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
          <button onClick={volver} className="p-2 -ml-2 rounded-lg hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: BG }}>
            <Asterisk size={22} style={{ color: A }} strokeWidth={2.5} />
          </div>
          <div className="leading-tight flex-1">
            <p className="font-display text-2xl tracking-tight">
              <span style={{ color: R }}>SUME</span> <span style={{ color: A }}>SALUD</span>
            </p>
            <p className="text-[10px] text-slate-400 tracking-[0.4em] uppercase mt-0.5">
              {nombre}
              {guardia ? ` · ${guardia.base.label} · Móvil ${guardia.movilFisico}` : ""}
            </p>
          </div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        {!slot ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 text-center mb-2">Tenés dos guardias asignadas hoy. ¿Cuál vas a hacer?</p>
            {slotsDisponibles.map((s) => {
              const a = asigHoy[`${HOY}:${nombre}:${s}`];
              const label = SLOTS.find((x) => x.id === s)?.label ?? s;
              if (!a) return null;
              return (
                <button key={s} onClick={() => setSlot(s)} className={`${card} p-4 w-full text-left flex items-center justify-between gap-3 hover:border-blue-200 transition-colors`}>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">{label}</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {a.base} · Móvil <span style={{ color: R }}>{a.movil}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.turno}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 shrink-0" />
                </button>
              );
            })}
          </div>
        ) : buscandoGuardia ? (
          <div className={`${card} p-6 text-center text-slate-400 text-sm`}>Cargando...</div>
        ) : !guardia ? (
          <PMSeleccion nombreParamedico={nombre} slot={slot} onConfirmar={(g) => setGuardia(g)} />
        ) : (
          <PMChecklist base={guardia.base} movilFisico={guardia.movilFisico} nombreParamedico={nombre} slot={slot} />
        )}
      </main>
    </div>
  );
}
