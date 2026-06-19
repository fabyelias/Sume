import { Asterisk, ChevronRight, ClipboardCheck, Stethoscope, Wrench } from "lucide-react";
import { A, BG, R, card, fontImport } from "../lib/theme";

export type Perfil = "jefe" | "paramedico" | "mecanico" | "medico";

const PERFILES: { id: Perfil; nombre: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { id: "jefe", nombre: "Jefe de Paramédicos", desc: "Dirección, médicos, turnos y mecánica", icon: <Asterisk size={26} />, color: R },
  { id: "paramedico", nombre: "Paramédico", desc: "Toma de guardia y checklist del móvil", icon: <ClipboardCheck size={26} />, color: A },
  { id: "mecanico", nombre: "Mecánico / Farmacia", desc: "Bitácora de fallas y stock de insumos", icon: <Wrench size={26} />, color: "#D97706" },
  { id: "medico", nombre: "Médico", desc: "Confirmar presencia en guardia", icon: <Stethoscope size={26} />, color: "#059669" },
];

export function Launcher({ onSelect }: { onSelect: (perfil: Perfil) => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: BG, fontFamily: "Inter, sans-serif" }}>
      <style>{fontImport}</style>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "white", border: `2px solid ${A}20` }}>
            <Asterisk size={32} style={{ color: A }} strokeWidth={2} />
          </div>
          <p className="font-display text-4xl">
            <span style={{ color: R }}>SUME</span> <span style={{ color: A }}>SALUD</span>
          </p>
          <p className="text-sm text-slate-400 mt-1.5">Elegí con qué perfil querés ingresar</p>
        </div>
        <div className="grid gap-3">
          {PERFILES.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`${card} p-5 text-left flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all`}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${p.color}14`, color: p.color }}>
                {p.icon}
              </div>
              <div className="flex-1">
                <p className="font-display text-lg text-slate-800 leading-tight">{p.nombre}</p>
                <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 text-center">Fase de pruebas · selección libre de perfil, sin usuario ni contraseña</p>
      </div>
    </div>
  );
}
