import { AlertCircle, ArrowLeft, Boxes, CheckCircle2, ChevronDown, Gauge, Pill, Wrench, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { KpiCard } from "../../components/shared/KpiCard";
import { SecTitle } from "../../components/shared/SecTitle";
import { api } from "../../lib/api";
import { A, BG, R, card, fontImport } from "../../lib/theme";
import type { Movil } from "../../types";
import { MedEstadoChip } from "./MedEstadoChip";
import { STOCK_INICIAL_MEC } from "./data";

const TABS = [
  { id: "flota", label: "Estado de flota" },
  { id: "stock", label: "Stock / Farmacia" },
] as const;
type Tab = (typeof TABS)[number]["id"];

function CheckToggle({ ok, label, onClick }: { ok: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2.5 rounded-lg border p-3 text-left transition-colors ${ok ? "border-slate-100 hover:bg-slate-50" : "border-rose-200 bg-rose-50/60 hover:bg-rose-50"}`}>
      {ok ? <CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> : <XCircle size={15} className="text-rose-500 shrink-0" />}
      <span className={`text-sm ${ok ? "text-slate-600" : "text-rose-700 font-semibold"}`}>{label}</span>
    </button>
  );
}

function StepperO2({ label, value, total, onChange }: { label: string; value: number; total: number; onChange: (v: number) => void }) {
  return (
    <div className={`${card} p-3`}>
      <p className="text-xs text-slate-500 mb-1.5">{label}</p>
      <div className="flex items-center justify-between">
        <button onClick={() => onChange(Math.max(0, value - 1))} className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 font-bold hover:bg-slate-50">
          −
        </button>
        <p className="font-display text-lg text-slate-800">
          {value}
          <span className="text-slate-400">/{total}</span>
        </p>
        <button onClick={() => onChange(Math.min(total, value + 1))} className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 font-bold hover:bg-slate-50">
          +
        </button>
      </div>
    </div>
  );
}

export function PanelMecanico({ onBack }: { onBack: () => void }) {
  const [moviles, setMoviles] = useState<Movil[]>([]);
  const [stock, setStock] = useState(STOCK_INICIAL_MEC);
  const [tab, setTab] = useState<Tab>("flota");
  const [expand, setExpand] = useState<string | null>(null);
  const [expandStock, setExpandStock] = useState<string | null>(null);

  useEffect(() => {
    const load = () => api.moviles().then(setMoviles);
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, []);

  const actualizarMovil = (id: string, cambios: Partial<Movil>) => {
    setMoviles((prev) => prev.map((m) => (m.id !== id ? m : { ...m, ...cambios })));
    api.editarMovil(id, cambios);
  };

  const updateStock = (movilId: string, idx: number, delta: number) =>
    setStock((prev) => ({ ...prev, [movilId]: (prev[movilId] ?? []).map((it, i) => (i === idx ? { ...it, cantidad: Math.max(0, it.cantidad + delta) } : it)) }));

  const fallasDe = (m: Movil) => {
    const checks = [!m.mecanica.chocado, m.mecanica.aceite, m.mecanica.agua, m.mecanica.frenos, m.electro.dea, m.electro.ciclador, m.bolsos.via, m.bolsos.paro, m.bolsos.maletin, m.bolsos.trauma];
    return checks.filter((ok) => !ok).length + (m.oxigeno.cOk < m.oxigeno.c ? 1 : 0) + (m.oxigeno.mOk < m.oxigeno.m ? 1 : 0);
  };

  const totalFallas = moviles.reduce((acc, m) => acc + fallasDe(m), 0);
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
          <KpiCard label="Móviles en flota" value={moviles.length} color="#D97706">
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
              {moviles.length === 0 && <div className={`${card} p-6 text-center text-sm text-slate-400`}>Sin móviles cargados. Agregalos desde el Panel Jefe → Flota.</div>}
              {moviles.map((m) => {
                const open = expand === m.id;
                const fallas = fallasDe(m);
                return (
                  <div key={m.id} className={`${card} overflow-hidden`}>
                    <button onClick={() => setExpand(open ? null : m.id)} className="w-full flex items-center justify-between p-4 text-left">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-2.5 w-2.5 rounded-full ${fallas > 0 ? "bg-rose-500" : "bg-emerald-500"}`} />
                        <div>
                          <p className="font-display text-xl text-slate-800">
                            Móvil <span style={{ color: R }}>{m.id}</span> <span className="text-slate-400 text-base">· {m.nombre}</span>
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Gauge size={12} /> {m.km.toLocaleString("es-AR")} km · {m.estado === "activo" ? "En servicio" : m.estado === "taller" ? "En taller" : "Inactivo"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {fallas > 0 ? (
                          <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border bg-rose-50 text-rose-600 border-rose-200">{fallas} a revisar</span>
                        ) : (
                          <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200">Todo OK</span>
                        )}
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    {open && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-4">
                        <div>
                          <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-[0.2em] font-semibold">Mecánica</p>
                          <div className="grid sm:grid-cols-2 gap-2">
                            <CheckToggle ok={!m.mecanica.chocado} label="Sin choques" onClick={() => actualizarMovil(m.id, { mecanica: { ...m.mecanica, chocado: !m.mecanica.chocado } })} />
                            <CheckToggle ok={m.mecanica.aceite} label="Aceite" onClick={() => actualizarMovil(m.id, { mecanica: { ...m.mecanica, aceite: !m.mecanica.aceite } })} />
                            <CheckToggle ok={m.mecanica.agua} label="Agua" onClick={() => actualizarMovil(m.id, { mecanica: { ...m.mecanica, agua: !m.mecanica.agua } })} />
                            <CheckToggle ok={m.mecanica.frenos} label="Frenos" onClick={() => actualizarMovil(m.id, { mecanica: { ...m.mecanica, frenos: !m.mecanica.frenos } })} />
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-[0.2em] font-semibold">Terapia</p>
                          <div className="grid sm:grid-cols-2 gap-2 mb-2">
                            <CheckToggle ok={m.electro.dea} label="DEA" onClick={() => actualizarMovil(m.id, { electro: { ...m.electro, dea: !m.electro.dea } })} />
                            <CheckToggle ok={m.electro.ciclador} label="Ciclador" onClick={() => actualizarMovil(m.id, { electro: { ...m.electro, ciclador: !m.electro.ciclador } })} />
                          </div>
                          <div className="grid sm:grid-cols-2 gap-2">
                            <StepperO2 label="O₂ tubos centrales" value={m.oxigeno.cOk} total={m.oxigeno.c} onChange={(v) => actualizarMovil(m.id, { oxigeno: { ...m.oxigeno, cOk: v } })} />
                            <StepperO2 label="O₂ tubos manuales" value={m.oxigeno.mOk} total={m.oxigeno.m} onChange={(v) => actualizarMovil(m.id, { oxigeno: { ...m.oxigeno, mOk: v } })} />
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-[0.2em] font-semibold">Bolsos</p>
                          <div className="grid sm:grid-cols-2 gap-2">
                            <CheckToggle ok={m.bolsos.via} label="Bolso de vía" onClick={() => actualizarMovil(m.id, { bolsos: { ...m.bolsos, via: !m.bolsos.via } })} />
                            <CheckToggle ok={m.bolsos.paro} label="Bolso de paro" onClick={() => actualizarMovil(m.id, { bolsos: { ...m.bolsos, paro: !m.bolsos.paro } })} />
                            <CheckToggle ok={m.bolsos.maletin} label="Maletín médico" onClick={() => actualizarMovil(m.id, { bolsos: { ...m.bolsos, maletin: !m.bolsos.maletin } })} />
                            <CheckToggle ok={m.bolsos.trauma} label="Bolso de trauma" onClick={() => actualizarMovil(m.id, { bolsos: { ...m.bolsos, trauma: !m.bolsos.trauma } })} />
                          </div>
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
                        {s.length === 0 && <p className="text-sm text-slate-400 py-2">Sin ítems cargados para este móvil.</p>}
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
