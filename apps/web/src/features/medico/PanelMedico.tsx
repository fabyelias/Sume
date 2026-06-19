import { ArrowLeft, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { A, BG, R, card, fontImport } from "../../lib/theme";
import type { Medico } from "../../types";
import { PanelMedicoPrincipal } from "./PanelMedicoPrincipal";

export function PanelMedico({ onBack }: { onBack: () => void }) {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [medico, setMedico] = useState<Medico | null>(null);

  useEffect(() => {
    api.medicos().then(setMedicos);
  }, []);

  if (!medico) {
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
            {medicos.map((m) => (
              <button key={m.id} onClick={() => setMedico(m)} className={`${card} p-4 text-left flex items-center gap-3 hover:border-blue-200 transition-colors`}>
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
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <PanelMedicoPrincipal medico={medico} onBack={() => setMedico(null)} />;
}
