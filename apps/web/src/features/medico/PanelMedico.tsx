import { ArrowLeft, ChevronRight, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import { HOY, SLOTS, type Slot } from "../../data/constants";
import { api } from "../../lib/api";
import { A, BG, R, card, fontImport } from "../../lib/theme";
import type { GuardiasMedicas, Medico } from "../../types";
import { PanelMedicoPrincipal } from "./PanelMedicoPrincipal";

export function PanelMedico({ onBack }: { onBack: () => void }) {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [guardiasHoy, setGuardiasHoy] = useState<GuardiasMedicas>({});
  const [cargando, setCargando] = useState(true);
  const [medico, setMedico] = useState<Medico | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);

  useEffect(() => {
    Promise.all([api.medicos(), api.getGuardiasMedicas()]).then(([ms, g]) => {
      setMedicos(ms);
      setGuardiasHoy(g);
      setCargando(false);
    });
  }, []);

  const slotsDe = (id: string): Slot[] => SLOTS.map((s) => s.id).filter((s) => !!guardiasHoy[`${id}:${HOY}:${s}`]?.estado);

  const elegirMedico = (m: Medico) => {
    setMedico(m);
    const slots = slotsDe(m.id);
    setSlot(slots.length === 1 ? slots[0] : null);
  };

  if (!medico) {
    const disponibles = medicos.filter((m) => slotsDe(m.id).length > 0);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative" style={{ background: BG, fontFamily: "Inter, sans-serif" }}>
        <style>{fontImport}</style>
        <button onClick={onBack} className="absolute top-6 left-6 p-2 rounded-lg hover:bg-white transition-colors">
          <ArrowLeft size={20} className="text-slate-400" />
        </button>
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "white", border: `2px solid ${A}20` }}>
              <Stethoscope size={32} style={{ color: A }} />
            </div>
            <p className="font-display text-3xl">
              <span style={{ color: R }}>SUME</span> <span style={{ color: A }}>SALUD</span>
            </p>
            <p className="text-sm text-slate-400 mt-1">¿Quién toma guardia hoy?</p>
          </div>
          <div className="grid gap-2">
            {cargando ? (
              <div className={`${card} p-6 text-center text-slate-400 text-sm`}>Cargando...</div>
            ) : disponibles.length === 0 ? (
              <div className={`${card} p-6 text-center text-slate-400 text-sm`}>Todavía nadie tiene una guardia asignada hoy. Hablá con el Jefe de Paramédicos.</div>
            ) : (
              disponibles.map((m) => (
                <button key={m.id} onClick={() => elegirMedico(m)} className={`${card} p-4 text-left flex items-center gap-3 hover:border-blue-200 transition-colors`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm text-white shrink-0" style={{ background: A }}>
                    {m.nombre.replace(/Dr[a]?\. /, "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{m.nombre}</p>
                    <p className="text-xs text-slate-400">
                      {m.especialidad} · Móvil {m.movilFijo}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!slot) {
    const slots = slotsDe(medico.id);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: BG, fontFamily: "Inter, sans-serif" }}>
        <style>{fontImport}</style>
        <div className="w-full max-w-sm space-y-3">
          <p className="text-sm text-slate-500 text-center mb-2">Tenés dos guardias asignadas hoy. ¿Cuál vas a hacer?</p>
          {slots.map((s) => {
            const g = guardiasHoy[`${medico.id}:${HOY}:${s}`];
            const label = SLOTS.find((x) => x.id === s)?.label ?? s;
            return (
              <button key={s} onClick={() => setSlot(s)} className={`${card} p-4 w-full text-left flex items-center justify-between gap-3 hover:border-blue-200 transition-colors`}>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    Móvil <span style={{ color: R }}>{g?.movilAsig || medico.movilFijo}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {g?.horaIngreso || "—"} – {g?.horaFin || "—"}
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-300 shrink-0" />
              </button>
            );
          })}
          <button onClick={() => setMedico(null)} className="w-full py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <PanelMedicoPrincipal
      medico={medico}
      slot={slot}
      onBack={() => {
        if (slotsDe(medico.id).length > 1) setSlot(null);
        else setMedico(null);
      }}
    />
  );
}
