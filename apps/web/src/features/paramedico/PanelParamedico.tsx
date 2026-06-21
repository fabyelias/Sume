import { ArrowLeft, Asterisk } from "lucide-react";
import { useEffect, useState } from "react";
import { HOY } from "../../data/constants";
import { api } from "../../lib/api";
import { A, BG, R, card, fontImport } from "../../lib/theme";
import type { Base, Paramedico } from "../../types";
import { PMChecklist } from "./PMChecklist";
import { PMSeleccion } from "./PMSeleccion";

type Guardia = { base: Base; movilFisico: string };

export function PanelParamedico({ onBack }: { onBack: () => void }) {
  const [paramedicos, setParamedicos] = useState<Paramedico[]>([]);
  const [nombre, setNombre] = useState<string | null>(null);
  const [guardia, setGuardia] = useState<Guardia | null>(null);
  const [buscandoGuardia, setBuscandoGuardia] = useState(false);

  useEffect(() => {
    api.paramedicos().then(setParamedicos);
  }, []);

  // Si ya tiene un checklist enviado hoy, salta directo a él en vez de
  // hacerlo elegir base/móvil de nuevo (eso ya quedó fijo al confirmar).
  useEffect(() => {
    if (!nombre) return;
    setBuscandoGuardia(true);
    api.getChecklistsPM().then((checklists) => {
      const rec = checklists[`${HOY}:${nombre}`];
      if (rec) setGuardia({ base: rec.base, movilFisico: rec.movilFisico });
      setBuscandoGuardia(false);
    });
  }, [nombre]);

  if (!nombre) {
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
            {paramedicos.map(({ nombre: n }) => (
              <button key={n} onClick={() => setNombre(n)} className={`${card} p-4 text-left flex items-center gap-3 hover:border-blue-200 transition-colors`}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm text-white shrink-0" style={{ background: A }}>
                  {n.split(" ").map((x) => x[0]).join("").slice(0, 2)}
                </div>
                <p className="font-semibold text-slate-800">{n}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: BG, fontFamily: "Inter, sans-serif" }}>
      <style>{fontImport}</style>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
          <button onClick={() => (guardia ? setGuardia(null) : onBack())} className="p-2 -ml-2 rounded-lg hover:bg-slate-50 transition-colors">
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
        {buscandoGuardia ? (
          <div className={`${card} p-6 text-center text-slate-400 text-sm`}>Cargando...</div>
        ) : !guardia ? (
          <PMSeleccion nombreParamedico={nombre} onConfirmar={(g) => setGuardia(g)} />
        ) : (
          <PMChecklist base={guardia.base} movilFisico={guardia.movilFisico} nombreParamedico={nombre} />
        )}
      </main>
    </div>
  );
}
