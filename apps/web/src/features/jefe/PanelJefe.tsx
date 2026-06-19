import { ArrowLeft, Asterisk } from "lucide-react";
import { useState } from "react";
import { A, BG, R, fontImport } from "../../lib/theme";
import { JefeAsignacion } from "./JefeAsignacion";
import { JefeDireccion } from "./JefeDireccion";
import { JefeFlota } from "./JefeFlota";
import { JefeMecanica } from "./JefeMecanica";
import { JefeMedicos } from "./JefeMedicos";
import { JefePersonal } from "./JefePersonal";

const TABS = [
  { id: "direccion", label: "Dirección" },
  { id: "medicos", label: "Médicos" },
  { id: "personal", label: "Personal" },
  { id: "flota", label: "Flota" },
  { id: "asignacion", label: "Turnos" },
  { id: "mecanica", label: "Mecánica" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function PanelJefe({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("direccion");

  return (
    <div className="min-h-screen" style={{ background: BG, fontFamily: "Inter, sans-serif" }}>
      <style>{fontImport}</style>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-slate-50 transition-colors">
              <ArrowLeft size={20} className="text-slate-400" />
            </button>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: BG }}>
              <Asterisk size={24} style={{ color: A }} strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display text-2xl tracking-tight">
                <span style={{ color: R }}>SUME</span> <span style={{ color: A }}>SALUD</span>
              </p>
              <p className="text-[10px] text-slate-400 tracking-[0.4em] uppercase mt-0.5">Panel Jefe de Paramédicos</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 border border-slate-200 rounded-full px-3 py-1.5">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En vivo · {new Date().toLocaleDateString("es-AR")}
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${tab === t.id ? "text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"}`}
              style={tab === t.id ? { borderColor: R } : { borderColor: "transparent" }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {tab === "direccion" && <JefeDireccion />}
        {tab === "medicos" && <JefeMedicos />}
        {tab === "personal" && <JefePersonal />}
        {tab === "flota" && <JefeFlota />}
        {tab === "asignacion" && <JefeAsignacion />}
        {tab === "mecanica" && <JefeMecanica />}
      </main>
    </div>
  );
}
