import { AlertCircle, ArrowLeft, Boxes, ChevronDown, Gauge, Pill, Wrench, XCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { KpiCard } from "../../components/shared/KpiCard";
import { SecTitle } from "../../components/shared/SecTitle";
import { A, BG, R, card, fontImport } from "../../lib/theme";
import { BitacoraTicket } from "./BitacoraTicket";
import { MOVILES_MEC, STOCK_INICIAL_MEC } from "./data";
import { MedEstadoChip } from "./MedEstadoChip";
import type { ChecklistItemMec } from "./types";

const TABS = [
  { id: "flota", label: "Estado de flota" },
  { id: "stock", label: "Stock / Farmacia" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function PanelMecanico({ onBack }: { onBack: () => void }) {
  const [moviles, setMoviles] = useState(MOVILES_MEC);
  const [stock, setStock] = useState(STOCK_INICIAL_MEC);
  const [tab, setTab] = useState<Tab>("flota");
  const [expand, setExpand] = useState<string | null>(MOVILES_MEC[0].id);
  const [expandStock, setExpandStock] = useState<string | null>(MOVILES_MEC[0].id);

  const updateItem = (movilId: string, itemId: string, nuevo: ChecklistItemMec) =>
    setMoviles((prev) => prev.map((m) => (m.id !== movilId ? m : { ...m, items: m.items.map((i) => (i.id === itemId ? { ...i, ...nuevo } : i)) })));

  const updateStock = (movilId: string, idx: number, delta: number) =>
    setStock((prev) => ({ ...prev, [movilId]: prev[movilId].map((it, i) => (i === idx ? { ...it, cantidad: Math.max(0, it.cantidad + delta) } : it)) }));

  const totalFallas = moviles.reduce((acc, m) => acc + m.items.filter((i) => !i.ok && i.estado !== "resuelto").length, 0);
  const totalMed = moviles.flatMap((m) => m.medicacion.filter((x) => x.estado !== "ok")).length;
  const totalStockBajo = Object.values(stock).flat().filter((i) => i.cantidad < i.minimo).length;

  return (
    <div className="min-h-screen" style={{ background: BG, fontFamily: "Inter, sans-serif" }}>
      <style>{fontImport}</style>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: BG }}>
            <Wrench size={20} style={{ color: A }} />
          </div>
          <div className="leading-tight">
            <p className="font-display text-2xl tracking-tight">
              <span style={{ color: R }}>SUME</span> <span style={{ color: A }}>SALUD</span>
            </p>
            <p className="text-[10px] text-slate-400 tracking-[0.4em] uppercase mt-0.5">Panel Mecánico · Farmacia</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${tab === t.id ? "text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"}`}
              style={tab === t.id ? { borderColor: R } : { borderColor: "transparent" }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KpiCard label="Fallas mecánicas" value={totalFallas} color={R}>
            <Wrench size={18} />
          </KpiCard>
          <KpiCard label="Alertas medicación" value={totalMed} color="#D97706">
            <Pill size={18} />
          </KpiCard>
          <KpiCard label="Stock bajo mínimo" value={totalStockBajo} color="#DC2626">
            <Boxes size={18} />
          </KpiCard>
        </div>

        {tab === "flota" && (
          <section>
            <SecTitle>Estado de la flota</SecTitle>
            <div className="space-y-3 mt-3">
              {moviles.map((m) => {
                const open = expand === m.id;
                const fallas = m.items.filter((i) => !i.ok);
                const pendientes = fallas.filter((i) => i.estado !== "resuelto");
                const hayAlgo = fallas.length > 0;
                return (
                  <div key={m.id} className={`${card} overflow-hidden`}>
                    <button onClick={() => setExpand(open ? null : m.id)} className="w-full flex items-center justify-between p-4 text-left">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-2.5 w-2.5 rounded-full ${pendientes.length > 0 ? "bg-rose-500" : "bg-emerald-500"}`} />
                        <div>
                          <p className="font-display text-xl text-slate-800">
                            Móvil <span style={{ color: R }}>{m.id}</span>
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Gauge size={12} /> {m.km.toLocaleString("es-AR")} km · {m.para} · {m.turno} · {m.fecha}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!m.completo && <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border bg-slate-100 text-slate-500 border-slate-200">Incompleto</span>}
                        {pendientes.length > 0 ? (
                          <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border bg-rose-50 text-rose-600 border-rose-200">{pendientes.length} a revisar</span>
                        ) : hayAlgo ? (
                          <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200">Resuelto</span>
                        ) : null}
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    {open && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-4">
                        <div>
                          <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-[0.2em] font-semibold">Checklist</p>
                          <div className="space-y-2">
                            {m.items.map((i) => (
                              <div key={i.id} className={`rounded-lg border p-3 ${i.ok ? "border-slate-100" : "border-rose-200 bg-rose-50/60"}`}>
                                <div className="flex items-center gap-2.5">
                                  {i.ok ? <CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> : <XCircle size={15} className="text-rose-500 shrink-0" />}
                                  <span className={`text-sm ${i.ok ? "text-slate-600" : "text-rose-700 font-semibold"}`}>{i.label}</span>
                                </div>
                                {!i.ok && (
                                  <div className="mt-2 pl-6">
                                    <BitacoraTicket ticket={i} onUpdate={(t) => updateItem(m.id, i.id, t)} />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 mb-1.5 uppercase tracking-[0.2em] font-semibold">Medicación</p>
                          {m.medicacion.length === 0 ? (
                            <p className="text-sm text-slate-400">Sin alertas.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {m.medicacion.map((med, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">{med.nombre}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-xs">{med.vence}</span>
                                    <MedEstadoChip estado={med.estado} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {tab === "stock" && (
          <section>
            <SecTitle icon={<Boxes size={13} />}>Stock de medicación e insumos</SecTitle>
            <div className="space-y-3 mt-3">
              {moviles.map((m) => {
                const s = stock[m.id] || [];
                const bajos = s.filter((i) => i.cantidad < i.minimo).length;
                const open = expandStock === m.id;
                return (
                  <div key={m.id} className={`${card} overflow-hidden`}>
                    <button onClick={() => setExpandStock(open ? null : m.id)} className="w-full flex items-center justify-between p-4 text-left">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-2.5 w-2.5 rounded-full ${bajos > 0 ? "bg-rose-500" : "bg-emerald-500"}`} />
                        <div>
                          <p className="font-display text-xl text-slate-800">
                            Móvil <span style={{ color: R }}>{m.id}</span>
                          </p>
                          <p className="text-xs text-slate-500">{s.length} ítems controlados</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {bajos > 0 && <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border bg-rose-50 text-rose-600 border-rose-200">{bajos} bajo mínimo</span>}
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    {open && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-2">
                        {s.map((item, idx) => {
                          const bajo = item.cantidad < item.minimo;
                          return (
                            <div key={idx} className={`rounded-lg border p-3 flex items-center justify-between gap-3 ${bajo ? "border-rose-200 bg-rose-50/60" : "border-slate-100"}`}>
                              <div className="min-w-0">
                                <p className={`text-sm font-medium ${bajo ? "text-rose-700" : "text-slate-700"}`}>{item.nombre}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-slate-400">vence {item.vence}</span>
                                  {item.estado !== "ok" && <MedEstadoChip estado={item.estado} />}
                                  {bajo && (
                                    <span className="text-[11px] font-bold uppercase text-rose-600 flex items-center gap-1">
                                      <AlertCircle size={11} /> Bajo mínimo
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => updateStock(m.id, idx, -1)} className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 text-base font-bold hover:bg-slate-50">
                                  −
                                </button>
                                <div className="w-12 text-center">
                                  <p className="font-display text-xl text-slate-800 leading-none">{item.cantidad}</p>
                                  <p className="text-[10px] text-slate-400">mín. {item.minimo}</p>
                                </div>
                                <button onClick={() => updateStock(m.id, idx, 1)} className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 text-base font-bold hover:bg-slate-50">
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
