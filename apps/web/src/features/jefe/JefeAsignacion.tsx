import { Calendar, CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, Pencil, Plus, Trash2, Truck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { SecTitle } from "../../components/shared/SecTitle";
import { HOY, MOVILES_FIS, SLOTS, type Slot } from "../../data/constants";
import { api } from "../../lib/api";
import { A, G, R, card, grad } from "../../lib/theme";
import type { Asignaciones, Base, Cierres, Francos, Medico, Paramedico } from "../../types";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function JefeAsignacion() {
  const [paramedicos, setParamedicos] = useState<Paramedico[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [asig, setAsig] = useState<Asignaciones>({});
  const [cierres, setCierres] = useState<Cierres>({});
  const [editando, setEditando] = useState<{ nombre: string; slot: Slot } | null>(null);
  const [form, setForm] = useState({ base: "", movil: "", medico: "" });
  const semIni = new Date(2026, 5, 15);
  const [semBase, setSemBase] = useState(semIni);
  const [francos, setFrancos] = useState<Francos>({});
  const [editCell, setEditCell] = useState<{ fecha: string; nombre: string; slot: Slot } | null>(null);
  const [cellForm, setCellForm] = useState<{ base: string; movil: string; medico: string; libre: boolean }>({ base: "", movil: "", medico: "", libre: false });
  const [savingCell, setSavingCell] = useState(false);
  const [vistaSemana, setVistaSemana] = useState<"paramedico" | "movil">("paramedico");

  useEffect(() => {
    const load = async () => {
      setAsig(await api.getAsignaciones());
      setCierres(await api.getCierres());
      setFrancos(await api.getFrancos());
    };
    const loadCatalogo = async () => {
      setParamedicos(await api.paramedicos());
      setBases(await api.bases());
      setMedicos(await api.medicos());
    };
    loadCatalogo();
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, []);

  // Las claves de asignaciones/cierres incluyen la fecha y el slot
  // (HOY:nombre:slot) para que "la guardia de hoy" no arrastre datos de un
  // día anterior, y para soportar hasta 2 guardias el mismo día (ej: 07-19
  // en un móvil, 19-07 en otro).
  const keyHoy = (nombre: string, slot: Slot) => `${HOY}:${nombre}:${slot}`;

  // Elegir un médico acá (guardia del paramédico) también le crea/actualiza
  // su propia guardia (GuardiasMedicas) para esa fecha y slot — si no, el
  // médico nunca ve nada en su panel aunque el Jefe lo haya "asignado" en
  // la guardia del paramédico.
  const sincronizarGuardiaMedico = async (nombreMedico: string | undefined, fecha: string, slot: Slot, movil: string, turno: string) => {
    if (!nombreMedico) return;
    const medico = medicos.find((m) => m.nombre === nombreMedico);
    if (!medico) return;
    const horas = turno.match(/(\d{1,2}:\d{2}).*?(\d{1,2}:\d{2})/);
    const guardiasActuales = await api.getGuardiasMedicas();
    const key = `${medico.id}:${fecha}:${slot}`;
    const existente = guardiasActuales[key] || {};
    guardiasActuales[key] = {
      ...existente,
      estado: existente.estado || "pendiente",
      movilAsig: movil,
      horaIngreso: horas ? horas[1] : existente.horaIngreso,
      horaFin: horas ? horas[2] : existente.horaFin,
    };
    await api.setGuardiasMedicas(guardiasActuales);
  };

  const guardarAsig = async (nombre: string, slot: Slot) => {
    if (!form.base || !form.movil) return;
    const base = bases.find((b) => b.id === form.base);
    if (!base) return;
    const nuevo = { ...asig, [keyHoy(nombre, slot)]: { base: base.label, baseId: form.base, movil: form.movil, turno: base.turno, medico: form.medico || undefined } };
    setAsig(nuevo);
    await api.setAsignaciones(nuevo);
    await sincronizarGuardiaMedico(form.medico, HOY, slot, form.movil, base.turno);
    setEditando(null);
  };

  const eliminarAsig = async (nombre: string, slot: Slot) => {
    const nuevo = { ...asig };
    delete nuevo[keyHoy(nombre, slot)];
    setAsig(nuevo);
    await api.setAsignaciones(nuevo);
  };

  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(semBase);
    d.setDate(semBase.getDate() + i);
    return d;
  });
  const esHoy = (d: Date) => fmt(d) === HOY;

  // La planificación semanal usa el mismo store que "guardia de hoy"
  // (Asignaciones), solo que con la fecha del día que se esté editando en
  // vez de HOY — así una guardia cargada acá aparece también arriba si es
  // de hoy, y viceversa. Franco se guarda aparte porque es un estado del
  // día entero, no de un móvil/base puntual.
  const saveCell = async () => {
    if (!editCell) return;
    const { fecha, nombre, slot } = editCell;
    setSavingCell(true);
    if (cellForm.libre) {
      const nuevosFrancos = { ...francos, [`${fecha}:${nombre}`]: true };
      setFrancos(nuevosFrancos);
      await api.setFrancos(nuevosFrancos);
      const nuevoAsig = { ...asig };
      delete nuevoAsig[`${fecha}:${nombre}:1`];
      delete nuevoAsig[`${fecha}:${nombre}:2`];
      setAsig(nuevoAsig);
      await api.setAsignaciones(nuevoAsig);
    } else {
      const base = bases.find((b) => b.id === cellForm.base);
      const nuevoAsig = { ...asig, [`${fecha}:${nombre}:${slot}`]: { base: base?.label ?? "", baseId: cellForm.base, movil: cellForm.movil, turno: base?.turno ?? "", medico: cellForm.medico || undefined } };
      setAsig(nuevoAsig);
      await api.setAsignaciones(nuevoAsig);
      await sincronizarGuardiaMedico(cellForm.medico, fecha, slot, cellForm.movil, base?.turno ?? "");
      if (francos[`${fecha}:${nombre}`]) {
        const nuevosFrancos = { ...francos };
        delete nuevosFrancos[`${fecha}:${nombre}`];
        setFrancos(nuevosFrancos);
        await api.setFrancos(nuevosFrancos);
      }
    }
    setSavingCell(false);
    setEditCell(null);
  };

  const borrarCell = async () => {
    if (!editCell) return;
    const { fecha, nombre, slot } = editCell;
    setSavingCell(true);
    const nuevoAsig = { ...asig };
    delete nuevoAsig[`${fecha}:${nombre}:${slot}`];
    setAsig(nuevoAsig);
    await api.setAsignaciones(nuevoAsig);
    if (francos[`${fecha}:${nombre}`]) {
      const nuevosFrancos = { ...francos };
      delete nuevosFrancos[`${fecha}:${nombre}`];
      setFrancos(nuevosFrancos);
      await api.setFrancos(nuevosFrancos);
    }
    setSavingCell(false);
    setEditCell(null);
  };

  // Mismos datos de Asignaciones pero agrupados por móvil en vez de por
  // paramédico, para ver de un vistazo qué móvil queda sin cubrir cada día.
  const movilesEnUso = Array.from(new Set([...MOVILES_FIS, ...Object.values(asig).map((a) => a.movil)]));
  const paramedicoPorMovilYDia = (movil: string, d: Date) => {
    const fecha = fmt(d);
    for (const paramedico of paramedicos) {
      for (const { id, label } of SLOTS) {
        const a = asig[`${fecha}:${paramedico.nombre}:${id}`];
        if (a && a.movil === movil) return { nombre: paramedico.nombre, base: a.base, medico: a.medico, slotLabel: label };
      }
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <section>
        <SecTitle icon={<CalendarClock size={13} />}>Asignación de guardia de hoy</SecTitle>
        <p className="text-sm text-slate-500 mt-2 mb-3">
          Hasta 2 guardias por persona el mismo día, para cuando hacen las 24hs divididas en dos móviles o bases distintas.
        </p>
        <div className="grid gap-2">
          {paramedicos.map(({ nombre }) => {
            const slot1 = asig[keyHoy(nombre, "1")];
            const hayAlguna = !!slot1 || !!asig[keyHoy(nombre, "2")];
            return (
              <div key={nombre} className={`${card} overflow-hidden p-3 space-y-2`}>
                <div className="flex items-center gap-3 px-1">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm text-white shrink-0" style={{ background: A }}>
                    {nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{nombre}</p>
                  {!hayAlguna && <p className="text-xs text-slate-400 italic">Sin asignación</p>}
                </div>
                {SLOTS.map(({ id, label }) => {
                  if (id === "2" && !slot1) return null;
                  const a = asig[keyHoy(nombre, id)];
                  const cierre = cierres[keyHoy(nombre, id)];
                  const editMe = editando?.nombre === nombre && editando?.slot === id;
                  if (!a && !editMe) {
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setEditando({ nombre, slot: id });
                          setForm({ base: "", movil: "", medico: "" });
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-slate-200 text-xs font-semibold text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-colors"
                      >
                        <Plus size={13} /> {id === "1" ? "Agregar guardia" : "Agregar 2da guardia (24 hs en otro móvil)"}
                      </button>
                    );
                  }
                  const turnoEnVivo = a?.turno || (editMe ? bases.find((b) => b.id === form.base)?.turno : undefined);
                  return (
                    <div key={id} className="rounded-xl border border-slate-100 overflow-hidden">
                      <div className="p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
                            {label}
                            {turnoEnVivo && <span style={{ color: R }}> · {turnoEnVivo}</span>}
                          </p>
                          {a && (
                            <p className="text-xs text-slate-600 mt-0.5">
                              {a.base} · Móvil <span style={{ color: R }} className="font-semibold">{a.movil}</span> · {a.turno}
                              {a.medico && (
                                <>
                                  {" · "}
                                  <span style={{ color: A }} className="font-semibold">{a.medico}</span>
                                </>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {cierre?.firmado && (
                            <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 size={11} />
                              Firmado {cierre.hora}
                            </span>
                          )}
                          {!cierre?.firmado && a && <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border bg-amber-50 text-amber-600 border-amber-200">En curso</span>}
                          <button
                            onClick={() => {
                              setEditando({ nombre, slot: id });
                              setForm({ base: a?.baseId || "", movil: a?.movil || "", medico: a?.medico || "" });
                            }}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                          >
                            <Pencil size={14} className="text-slate-400" />
                          </button>
                          {a && (
                            <button onClick={() => eliminarAsig(nombre, id)} className="p-2 rounded-lg border border-slate-200 hover:bg-red-50">
                              <Trash2 size={14} className="text-rose-400" />
                            </button>
                          )}
                        </div>
                      </div>
                      {editMe && (
                        <div className="border-t border-slate-100 px-3 pb-3 pt-2 space-y-3">
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
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Médico (opcional)</p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setForm((f) => ({ ...f, medico: "" }))}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${!form.medico ? "text-white border-transparent" : "border-slate-200 text-slate-500"}`}
                                style={!form.medico ? { background: G } : {}}
                              >
                                Sin médico
                              </button>
                              {medicos.map((m) => (
                                <button
                                  key={m.id}
                                  onClick={() => setForm((f) => ({ ...f, medico: m.nombre }))}
                                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${form.medico === m.nombre ? "text-white border-transparent" : "border-slate-200 text-slate-500"}`}
                                  style={form.medico === m.nombre ? { background: A } : {}}
                                >
                                  {m.nombre}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditando(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">
                              Cancelar
                            </button>
                            <button
                              onClick={() => guardarAsig(nombre, id)}
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
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <SecTitle icon={<Calendar size={13} />}>Planificación semanal</SecTitle>
          <div className="flex gap-1 rounded-xl border border-slate-200 p-1">
            <button
              onClick={() => setVistaSemana("paramedico")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${vistaSemana === "paramedico" ? "text-white" : "text-slate-500"}`}
              style={vistaSemana === "paramedico" ? { background: A } : {}}
            >
              <Users size={13} /> Por paramédico
            </button>
            <button
              onClick={() => setVistaSemana("movil")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${vistaSemana === "movil" ? "text-white" : "text-slate-500"}`}
              style={vistaSemana === "movil" ? { background: A } : {}}
            >
              <Truck size={13} /> Por móvil
            </button>
          </div>
        </div>
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
        {vistaSemana === "paramedico" ? (
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
                  const fecha = fmt(d);
                  const hoy = esHoy(d);
                  const esFranco = !!francos[`${fecha}:${nombre}`];
                  const s1 = asig[`${fecha}:${nombre}:1`];
                  const s2 = asig[`${fecha}:${nombre}:2`];
                  const editandoSlot1 = editCell?.fecha === fecha && editCell?.nombre === nombre && editCell?.slot === "1";
                  const editandoSlot2 = editCell?.fecha === fecha && editCell?.nombre === nombre && editCell?.slot === "2";

                  const abrirEditor = (slot: Slot, prefill?: { base: string; movil: string; medico: string; libre: boolean }) => {
                    setEditCell({ fecha, nombre, slot });
                    setCellForm(prefill ?? { base: "", movil: "", medico: "", libre: false });
                  };

                  const mostrarBorrar = editCell?.slot === "1" ? !!s1 || esFranco : !!s2;

                  const editor = (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-2 space-y-1.5">
                      {editCell?.slot === "1" && (
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
                      )}
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
                          <select
                            value={cellForm.medico}
                            onChange={(e) => setCellForm((f) => ({ ...f, medico: e.target.value }))}
                            className="w-full rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[10px] focus:outline-none"
                          >
                            <option value="">Sin médico</option>
                            {medicos.map((m) => (
                              <option key={m.id} value={m.nombre}>
                                {m.nombre}
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                      <div className="flex gap-1">
                        <button onClick={() => setEditCell(null)} className="flex-1 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-500">
                          ✕
                        </button>
                        {mostrarBorrar && (
                          <button onClick={borrarCell} disabled={savingCell} className="flex-1 py-1 rounded-lg border border-rose-200 bg-white text-[10px] font-bold text-rose-500 flex items-center justify-center">
                            <Trash2 size={11} />
                          </button>
                        )}
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
                  );

                  return (
                    <div key={di} className={`p-1.5 border-r border-slate-100 last:border-r-0 space-y-1 ${hoy ? "bg-blue-50/40" : ""}`}>
                      {editandoSlot1 ? (
                        editor
                      ) : esFranco ? (
                        <div
                          className="rounded-xl p-1.5 text-[10px] leading-tight cursor-pointer bg-slate-100 border border-slate-200 text-center"
                          onClick={() => abrirEditor("1", { base: "", movil: "", medico: "", libre: true })}
                        >
                          <span className="text-slate-400 font-semibold uppercase">Franco</span>
                        </div>
                      ) : s1 ? (
                        <div
                          className="rounded-xl p-1.5 text-[10px] leading-tight cursor-pointer border"
                          style={{ background: `${A}0D`, borderColor: `${A}30` }}
                          onClick={() => abrirEditor("1", { base: s1.baseId, movil: s1.movil, medico: s1.medico ?? "", libre: false })}
                        >
                          <p style={{ color: R }} className="font-bold">
                            Móvil {s1.movil}
                          </p>
                          <p className="text-slate-500">{s1.turno}</p>
                          {s1.medico && (
                            <p style={{ color: A }} className="font-semibold truncate">
                              {s1.medico}
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => abrirEditor("1")}
                          className="w-full min-h-[44px] rounded-xl border border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors flex items-center justify-center"
                        >
                          <Plus size={12} className="text-slate-300" />
                        </button>
                      )}

                      {!esFranco &&
                        s1 &&
                        (editandoSlot2 ? (
                          editor
                        ) : s2 ? (
                          <div
                            className="rounded-xl p-1.5 text-[10px] leading-tight cursor-pointer border"
                            style={{ background: `${R}0D`, borderColor: `${R}30` }}
                            onClick={() => abrirEditor("2", { base: s2.baseId, movil: s2.movil, medico: s2.medico ?? "", libre: false })}
                          >
                            <p style={{ color: R }} className="font-bold">
                              Móvil {s2.movil}
                            </p>
                            <p className="text-slate-500">{s2.turno}</p>
                            {s2.medico && (
                              <p style={{ color: A }} className="font-semibold truncate">
                                {s2.medico}
                              </p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => abrirEditor("2")}
                            className="w-full py-1 rounded-lg border border-dashed border-slate-200 hover:border-blue-300 text-[9px] text-slate-300 hover:text-blue-500 flex items-center justify-center gap-1"
                          >
                            <Plus size={9} /> 2da
                          </button>
                        ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        ) : (
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
            {movilesEnUso.map((movil, mi) => (
              <div key={movil} className={`grid border-b border-slate-100 last:border-b-0 ${mi % 2 === 1 ? "bg-slate-50/40" : ""}`} style={{ gridTemplateColumns: "110px repeat(7,1fr)" }}>
                <div className="p-2 border-r border-slate-100 flex items-center">
                  <p className="text-[11px] font-bold leading-tight" style={{ color: R }}>
                    Móvil {movil}
                  </p>
                </div>
                {diasSemana.map((d, di) => {
                  const cubierto = paramedicoPorMovilYDia(movil, d);
                  const hoy = esHoy(d);
                  return (
                    <div key={di} className={`p-1.5 border-r border-slate-100 last:border-r-0 ${hoy ? "bg-blue-50/40" : ""}`}>
                      {cubierto ? (
                        <div className="rounded-xl p-1.5 text-[10px] leading-tight border" style={{ background: `${A}0D`, borderColor: `${A}30` }}>
                          <p className="font-bold text-slate-700">{cubierto.nombre}</p>
                          <p className="text-slate-400">
                            {cubierto.base} · {cubierto.slotLabel}
                          </p>
                          {cubierto.medico && (
                            <p style={{ color: R }} className="font-semibold truncate">
                              {cubierto.medico}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="w-full min-h-[40px] rounded-xl border border-dashed border-rose-200 bg-rose-50/30 flex items-center justify-center">
                          <span className="text-[9px] font-bold uppercase text-rose-400">Sin cubrir</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        )}
      </section>
    </div>
  );
}
