import { Calendar, CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SecTitle } from "../../components/shared/SecTitle";
import { HOY, MOVILES_FIS } from "../../data/constants";
import { api } from "../../lib/api";
import { A, G, R, card, grad } from "../../lib/theme";
import type { Asignaciones, Base, Cierres, Paramedico, TurnoCelda, Turnos } from "../../types";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function JefeAsignacion() {
  const [paramedicos, setParamedicos] = useState<Paramedico[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [asig, setAsig] = useState<Asignaciones>({});
  const [cierres, setCierres] = useState<Cierres>({});
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState({ base: "", movil: "" });
  const semIni = new Date(2026, 5, 15);
  const [semBase, setSemBase] = useState(semIni);
  const [turnos, setTurnos] = useState<Turnos>({});
  const [editCell, setEditCell] = useState<string | null>(null);
  const [cellForm, setCellForm] = useState<{ base: string; movil: string; libre: boolean }>({ base: "", movil: "", libre: false });
  const [savingCell, setSavingCell] = useState(false);

  useEffect(() => {
    const load = async () => {
      setAsig(await api.getAsignaciones());
      setCierres(await api.getCierres());
      setTurnos(await api.getTurnos());
    };
    const loadCatalogo = async () => {
      setParamedicos(await api.paramedicos());
      setBases(await api.bases());
    };
    loadCatalogo();
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, []);

  const guardarAsig = async (nombre: string) => {
    if (!form.base || !form.movil) return;
    const base = bases.find((b) => b.id === form.base);
    if (!base) return;
    const nuevo = { ...asig, [nombre]: { base: base.label, baseId: form.base, movil: form.movil, turno: base.turno } };
    setAsig(nuevo);
    await api.setAsignaciones(nuevo);
    setEditando(null);
  };

  const eliminarAsig = async (nombre: string) => {
    const nuevo = { ...asig };
    delete nuevo[nombre];
    setAsig(nuevo);
    await api.setAsignaciones(nuevo);
  };

  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(semBase);
    d.setDate(semBase.getDate() + i);
    return d;
  });
  const esHoy = (d: Date) => fmt(d) === HOY;

  const saveCell = async () => {
    if (!editCell) return;
    setSavingCell(true);
    const base = bases.find((b) => b.id === cellForm.base);
    const valor: TurnoCelda = cellForm.libre
      ? { libre: true }
      : { libre: false, base: base?.label ?? "", baseId: cellForm.base, movil: cellForm.movil, turno: base?.turno ?? "" };
    const nuevo = { ...turnos, [editCell]: valor };
    setTurnos(nuevo);
    await api.setTurnos(nuevo);
    setSavingCell(false);
    setEditCell(null);
  };

  return (
    <div className="space-y-8">
      <section>
        <SecTitle icon={<CalendarClock size={13} />}>Asignación de guardia de hoy</SecTitle>
        <div className="grid gap-2 mt-3">
          {paramedicos.map(({ nombre }) => {
            const a = asig[nombre];
            const cierre = cierres[nombre];
            const editMe = editando === nombre;
            return (
              <div key={nombre} className={`${card} overflow-hidden`}>
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm text-white shrink-0" style={{ background: A }}>
                      {nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{nombre}</p>
                      {a ? (
                        <p className="text-xs text-slate-500">
                          {a.base} · Móvil <span style={{ color: R }} className="font-semibold">{a.movil}</span> · {a.turno}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Sin asignación</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {cierre?.firmado && (
                      <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        Firmado {cierre.hora}
                      </span>
                    )}
                    {!cierre?.firmado && a && <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border bg-amber-50 text-amber-600 border-amber-200">En curso</span>}
                    <button
                      onClick={() => {
                        setEditando(nombre);
                        setForm({ base: a?.baseId || "", movil: a?.movil || "" });
                      }}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                      <Pencil size={14} className="text-slate-400" />
                    </button>
                    {a && (
                      <button onClick={() => eliminarAsig(nombre)} className="p-2 rounded-lg border border-slate-200 hover:bg-red-50">
                        <Trash2 size={14} className="text-rose-400" />
                      </button>
                    )}
                  </div>
                </div>
                {editMe && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Base</p>
                      <div className="flex flex-wrap gap-2">
                        {bases.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => setForm((f) => ({ ...f, base: b.id }))}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${form.base === b.id ? "text-white border-transparent" : "border-slate-200 text-slate-500"}`}
                            style={form.base === b.id ? { background: A } : {}}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Móvil</p>
                      <div className="flex flex-wrap gap-2">
                        {MOVILES_FIS.map((m) => (
                          <button
                            key={m}
                            onClick={() => setForm((f) => ({ ...f, movil: m }))}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${form.movil === m ? "text-white border-transparent" : "border-slate-200 text-slate-500"}`}
                            style={form.movil === m ? { background: R } : {}}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditando(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">
                        Cancelar
                      </button>
                      <button
                        onClick={() => guardarAsig(nombre)}
                        disabled={!form.base || !form.movil}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-display uppercase tracking-wider ${form.base && form.movil ? "text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                        style={form.base && form.movil ? { background: grad } : {}}
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SecTitle icon={<Calendar size={13} />}>Planificación semanal</SecTitle>
        <div className="flex items-center justify-between mt-3 mb-4">
          <button
            onClick={() => {
              const d = new Date(semBase);
              d.setDate(d.getDate() - 7);
              setSemBase(d);
            }}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <ChevronLeft size={16} className="text-slate-500" />
          </button>
          <p className="font-display text-lg text-slate-800">
            {diasSemana[0].toLocaleDateString("es-AR", { day: "numeric", month: "short" })} — {diasSemana[6].toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          <button
            onClick={() => {
              const d = new Date(semBase);
              d.setDate(d.getDate() + 7);
              setSemBase(d);
            }}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <ChevronRight size={16} className="text-slate-500" />
          </button>
        </div>
        <div className={`${card} overflow-x-auto`}>
          <div className="min-w-[700px]">
            <div className="grid border-b border-slate-100" style={{ gridTemplateColumns: "110px repeat(7,1fr)" }}>
              <div className="p-2 text-[10px] text-slate-400 uppercase tracking-wide border-r border-slate-100" />
              {diasSemana.map((d, i) => (
                <div key={i} className={`p-2 text-center border-r border-slate-100 last:border-r-0 ${esHoy(d) ? "bg-blue-50" : ""}`}>
                  <p className="text-[10px] text-slate-400 uppercase">{DIAS[d.getDay()]}</p>
                  <p className={`font-display text-lg leading-tight ${esHoy(d) ? "text-blue-600" : "text-slate-700"}`}>{d.getDate()}</p>
                </div>
              ))}
            </div>
            {paramedicos.map(({ nombre }, pi) => (
              <div key={nombre} className={`grid border-b border-slate-100 last:border-b-0 ${pi % 2 === 1 ? "bg-slate-50/40" : ""}`} style={{ gridTemplateColumns: "110px repeat(7,1fr)" }}>
                <div className="p-2 border-r border-slate-100 flex items-center">
                  <p className="text-[11px] font-semibold text-slate-700 leading-tight">{nombre}</p>
                </div>
                {diasSemana.map((d, di) => {
                  const k = `${fmt(d)}:${nombre}`;
                  const t = turnos[k];
                  const hoy = esHoy(d);
                  const celEditando = editCell === k;
                  return (
                    <div key={di} className={`p-1.5 border-r border-slate-100 last:border-r-0 ${hoy ? "bg-blue-50/40" : ""}`}>
                      {celEditando ? (
                        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-2 space-y-1.5">
                          <div className="flex gap-1">
                            <button
                              onClick={() => setCellForm((f) => ({ ...f, libre: false }))}
                              className={`flex-1 text-[10px] font-bold uppercase py-1 rounded-lg border ${!cellForm.libre ? "text-white border-transparent" : "border-slate-200 text-slate-500 bg-white"}`}
                              style={!cellForm.libre ? { background: A } : {}}
                            >
                              Trabaja
                            </button>
                            <button
                              onClick={() => setCellForm((f) => ({ ...f, libre: true }))}
                              className={`flex-1 text-[10px] font-bold uppercase py-1 rounded-lg border ${cellForm.libre ? "text-white border-transparent" : "border-slate-200 text-slate-500 bg-white"}`}
                              style={cellForm.libre ? { background: G } : {}}
                            >
                              Franco
                            </button>
                          </div>
                          {!cellForm.libre && (
                            <>
                              <select
                                value={cellForm.base}
                                onChange={(e) => setCellForm((f) => ({ ...f, base: e.target.value }))}
                                className="w-full rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[10px] focus:outline-none"
                              >
                                <option value="">Base</option>
                                {bases.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.label}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={cellForm.movil}
                                onChange={(e) => setCellForm((f) => ({ ...f, movil: e.target.value }))}
                                className="w-full rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[10px] focus:outline-none"
                              >
                                <option value="">Móvil</option>
                                {MOVILES_FIS.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                            </>
                          )}
                          <div className="flex gap-1">
                            <button onClick={() => setEditCell(null)} className="flex-1 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-500">
                              ✕
                            </button>
                            <button
                              onClick={saveCell}
                              disabled={savingCell || (!cellForm.libre && (!cellForm.base || !cellForm.movil))}
                              className={`flex-1 py-1 rounded-lg text-[10px] font-bold text-white ${!cellForm.libre && (!cellForm.base || !cellForm.movil) ? "bg-slate-300" : ""}`}
                              style={cellForm.libre || (cellForm.base && cellForm.movil) ? { background: R } : {}}
                            >
                              {savingCell ? "..." : "✓"}
                            </button>
                          </div>
                        </div>
                      ) : t ? (
                        <div
                          className={`rounded-xl p-1.5 text-[10px] leading-tight cursor-pointer ${t.libre ? "bg-slate-100 border border-slate-200" : "border"}`}
                          style={!t.libre ? { background: `${A}0D`, borderColor: `${A}30` } : {}}
                          onClick={() => {
                            setCellForm(t.libre ? { base: "", movil: "", libre: true } : { base: t.baseId, movil: t.movil, libre: false });
                            setEditCell(k);
                          }}
                        >
                          {t.libre ? (
                            <span className="text-slate-400 font-semibold uppercase">Franco</span>
                          ) : (
                            <>
                              <p className="font-bold text-slate-700">{t.base}</p>
                              <p style={{ color: R }} className="font-bold">
                                Móvil {t.movil}
                              </p>
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setCellForm({ base: "", movil: "", libre: false });
                            setEditCell(k);
                          }}
                          className="w-full min-h-[48px] rounded-xl border border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors flex items-center justify-center"
                        >
                          <Plus size={12} className="text-slate-300" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
