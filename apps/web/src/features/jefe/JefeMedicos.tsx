import { CheckCircle2, ChevronDown, Clock, Lock, Pencil, Phone, Plus, Stethoscope, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { A, R, card, grad } from "../../lib/theme";
import { HOY, MOVILES_MED } from "../../data/constants";
import type { EstadoGuardiaMedica, GuardiaMedica, GuardiasMedicas, Medico, Pines } from "../../types";

const MEDICO_VACIO: Omit<Medico, "id"> = { nombre: "", especialidad: "", telefono: "", movilFijo: "", turno: "" };

const ESTADO_MAP: Record<EstadoGuardiaMedica, { label: string; dot: string; cls: string }> = {
  pendiente: { label: "Pendiente", dot: "bg-slate-300", cls: "text-slate-400" },
  en_camino: { label: "En camino", dot: "bg-amber-400", cls: "text-amber-600" },
  presente: { label: "Presente", dot: "bg-emerald-500", cls: "text-emerald-600" },
  ausente: { label: "Ausente", dot: "bg-rose-500", cls: "text-rose-600" },
};

export function JefeMedicos() {
  const [subTab, setSubTab] = useState<"guardias" | "perfiles">("guardias");
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [guardias, setGuardias] = useState<GuardiasMedicas>({});
  const [pines, setPines] = useState<Pines>({});
  const [expandG, setExpandG] = useState<string | null>(null);
  const [expandP, setExpandP] = useState<string | null>(null);
  const [editG, setEditG] = useState<string | null>(null);
  const [formG, setFormG] = useState<GuardiaMedica>({});
  const [editPin, setEditPin] = useState<string | null>(null);
  const [pinForm, setPinForm] = useState({ a: "", b: "" });
  const [pinOK, setPinOK] = useState(false);
  const [nuevoMedico, setNuevoMedico] = useState<Omit<Medico, "id"> | null>(null);
  const [guardando, setGuardando] = useState(false);

  const recargarMedicos = () => api.medicos().then(setMedicos);

  useEffect(() => {
    const load = async () => {
      setMedicos(await api.medicos());
      setGuardias(await api.getGuardiasMedicas());
      setPines(await api.getPines());
    };
    load();
  }, []);

  const crearMedico = async () => {
    if (!nuevoMedico?.nombre.trim()) return;
    setGuardando(true);
    await api.crearMedico(nuevoMedico);
    await recargarMedicos();
    setGuardando(false);
    setNuevoMedico(null);
  };

  const borrarMedico = async (id: string) => {
    await api.borrarMedico(id);
    await recargarMedicos();
  };

  const keyG = (id: string) => `${id}:${HOY}`;

  const saveG = async (id: string, datos: GuardiaMedica) => {
    const nuevo = { ...guardias, [keyG(id)]: datos };
    setGuardias(nuevo);
    await api.setGuardiasMedicas(nuevo);
  };

  const savePin = async (id: string) => {
    if (pinForm.a.length < 4 || pinForm.a !== pinForm.b) return;
    const nuevo = { ...pines, [id]: pinForm.a };
    setPines(nuevo);
    await api.setPines(nuevo);
    setPinOK(true);
    setTimeout(() => {
      setEditPin(null);
      setPinForm({ a: "", b: "" });
      setPinOK(false);
    }, 1200);
  };

  const renderGuardias = () => (
    <div className="space-y-3">
      {medicos.map((med) => {
        const g = guardias[keyG(med.id)] || {};
        const est = ESTADO_MAP[g.estado || "pendiente"];
        const open = expandG === med.id;
        const editando = editG === med.id;
        return (
          <div key={med.id} className={`${card} overflow-hidden`}>
            <button onClick={() => setExpandG(open ? null : med.id)} className="w-full flex items-center justify-between p-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm text-white" style={{ background: A }}>
                  {med.nombre.replace(/Dr[a]?\. /, "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{med.nombre}</p>
                  <p className="text-xs text-slate-400">
                    {med.especialidad} · Móvil fijo <span style={{ color: R }} className="font-semibold">{med.movilFijo}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase ${est.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${est.dot}`} />
                  {est.label}
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
              </div>
            </button>
            {open && (
              <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
                {!editando ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <p className="text-xs text-slate-400 mb-0.5">Ingreso</p>
                        <p className="font-semibold">{g.horaIngreso || "—"}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <p className="text-xs text-slate-400 mb-0.5">Fin</p>
                        <p className="font-semibold">{g.horaFin || "—"}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <p className="text-xs text-slate-400 mb-0.5">Móvil hoy</p>
                        <p className="font-semibold" style={{ color: R }}>
                          {g.movilAsig || med.movilFijo}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <p className="text-xs text-slate-400 mb-0.5">Traslado</p>
                        <p className="font-semibold">{g.traslado || "—"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditG(med.id);
                        setFormG({ ...g, movilAsig: g.movilAsig || med.movilFijo });
                      }}
                      className="flex items-center gap-2 text-sm text-slate-500 border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors"
                    >
                      <Pencil size={14} /> Editar guardia
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Estado</p>
                      <div className="flex gap-2 flex-wrap">
                        {(Object.entries(ESTADO_MAP) as [EstadoGuardiaMedica, (typeof ESTADO_MAP)[EstadoGuardiaMedica]][]).map(([id, e]) => (
                          <button
                            key={id}
                            onClick={() => setFormG((f) => ({ ...f, estado: id }))}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${formG.estado === id ? "text-white border-transparent" : "border-slate-200 text-slate-500"}`}
                            style={formG.estado === id ? { background: A } : {}}
                          >
                            {e.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Móvil hoy</p>
                      <div className="flex flex-wrap gap-2">
                        {MOVILES_MED.map((m) => (
                          <button
                            key={m}
                            onClick={() => setFormG((f) => ({ ...f, movilAsig: m }))}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${formG.movilAsig === m ? "text-white border-transparent" : "border-slate-200 text-slate-500"}`}
                            style={formG.movilAsig === m ? { background: R } : {}}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-1">Ingreso</p>
                        <input
                          type="time"
                          value={formG.horaIngreso || ""}
                          onChange={(e) => setFormG((f) => ({ ...f, horaIngreso: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-1">Fin</p>
                        <input
                          type="time"
                          value={formG.horaFin || ""}
                          onChange={(e) => setFormG((f) => ({ ...f, horaFin: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Traslado</p>
                      <div className="flex gap-2 flex-wrap">
                        {["Viene solo", "Uber / Remis", "Lo busca un móvil"].map((t) => (
                          <button
                            key={t}
                            onClick={() => setFormG((f) => ({ ...f, traslado: t }))}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${formG.traslado === t ? "text-white border-transparent" : "border-slate-200 text-slate-500"}`}
                            style={formG.traslado === t ? { background: A } : {}}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditG(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          saveG(med.id, formG);
                          setEditG(null);
                        }}
                        className="flex-1 py-2.5 rounded-xl text-sm font-display uppercase tracking-wider text-white"
                        style={{ background: grad }}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderPerfiles = () => (
    <div className="space-y-3">
      {!nuevoMedico ? (
        <button
          onClick={() => setNuevoMedico(MEDICO_VACIO)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
        >
          <Plus size={16} /> Nuevo médico
        </button>
      ) : (
        <div className={`${card} p-4 space-y-3 border-l-4`} style={{ borderLeftColor: A }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-semibold">Nuevo médico</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={nuevoMedico.nombre}
              onChange={(e) => setNuevoMedico((f) => f && { ...f, nombre: e.target.value })}
              placeholder="Nombre (ej: Dr. Pérez)"
              className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <input
              value={nuevoMedico.especialidad}
              onChange={(e) => setNuevoMedico((f) => f && { ...f, especialidad: e.target.value })}
              placeholder="Especialidad"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <input
              value={nuevoMedico.telefono}
              onChange={(e) => setNuevoMedico((f) => f && { ...f, telefono: e.target.value })}
              placeholder="Teléfono"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <input
              value={nuevoMedico.movilFijo}
              onChange={(e) => setNuevoMedico((f) => f && { ...f, movilFijo: e.target.value })}
              placeholder="Móvil fijo"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <input
              value={nuevoMedico.turno}
              onChange={(e) => setNuevoMedico((f) => f && { ...f, turno: e.target.value })}
              placeholder="Turno (ej: 07:00–19:00)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setNuevoMedico(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">
              Cancelar
            </button>
            <button
              onClick={crearMedico}
              disabled={!nuevoMedico.nombre.trim() || guardando}
              className={`flex-1 py-2.5 rounded-xl text-sm font-display uppercase tracking-wider ${nuevoMedico.nombre.trim() ? "text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
              style={nuevoMedico.nombre.trim() ? { background: grad } : {}}
            >
              {guardando ? "Guardando..." : "Crear médico"}
            </button>
          </div>
        </div>
      )}
      {medicos.map((med) => {
        const open = expandP === med.id;
        const tienePin = !!pines[med.id];
        const editando = editPin === med.id;
        const coincide = pinForm.a.length >= 4 && pinForm.a === pinForm.b;
        return (
          <div key={med.id} className={`${card} overflow-hidden`}>
            <button onClick={() => setExpandP(open ? null : med.id)} className="w-full flex items-center justify-between p-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-lg text-white" style={{ background: A }}>
                  {med.nombre.replace(/Dr[a]?\. /, "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{med.nombre}</p>
                  <p className="text-xs text-slate-400">
                    {med.especialidad} · Móvil {med.movilFijo} · {med.turno}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {tienePin ? (
                  <span className="text-[11px] font-bold uppercase px-2 py-1 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-1">
                    <Lock size={10} />
                    PIN activo
                  </span>
                ) : (
                  <span className="text-[11px] font-bold uppercase px-2 py-1 rounded-full border bg-amber-50 text-amber-600 border-amber-200">Sin PIN</span>
                )}
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
              </div>
            </button>
            {open && (
              <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className={`${card} p-3`}>
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <Stethoscope size={11} />
                      Especialidad
                    </p>
                    <p className="font-semibold text-slate-800 text-sm">{med.especialidad}</p>
                  </div>
                  <div className={`${card} p-3`}>
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <Phone size={11} />
                      Teléfono
                    </p>
                    <p className="font-semibold text-slate-800 text-sm">{med.telefono}</p>
                  </div>
                  <div className={`${card} p-3`}>
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <Clock size={11} />
                      Turno
                    </p>
                    <p className="font-semibold text-slate-800 text-sm">{med.turno}</p>
                  </div>
                  <div className={`${card} p-3`}>
                    <p className="text-xs text-slate-400 mb-1">Móvil fijo</p>
                    <p className="font-display text-xl" style={{ color: R }}>
                      {med.movilFijo}
                    </p>
                  </div>
                </div>
                {med.movilFijo === "Kangoo" && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
                    <span className="font-bold">Kangoo · Código Verde</span> — Horario variable según disponibilidad del médico.
                  </div>
                )}
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <Lock size={14} /> PIN de acceso
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{tienePin ? "PIN configurado · el médico lo usa para confirmar su presencia" : "Sin PIN asignado aún"}</p>
                    </div>
                    {!editando && (
                      <button
                        onClick={() => {
                          setEditPin(med.id);
                          setPinForm({ a: "", b: "" });
                          setPinOK(false);
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                      >
                        <Pencil size={13} /> {tienePin ? "Cambiar" : "Crear PIN"}
                      </button>
                    )}
                  </div>
                  {editando && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-1.5">Nuevo PIN</p>
                        <input
                          type="password"
                          value={pinForm.a}
                          maxLength={8}
                          onChange={(e) => setPinForm((f) => ({ ...f, a: e.target.value }))}
                          placeholder="Mínimo 4 dígitos"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-lg font-display tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:tracking-normal placeholder:text-slate-300"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-1.5">Confirmar PIN</p>
                        <input
                          type="password"
                          value={pinForm.b}
                          maxLength={8}
                          onChange={(e) => setPinForm((f) => ({ ...f, b: e.target.value }))}
                          placeholder="Repetí el PIN"
                          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-lg font-display tracking-[0.4em] focus:outline-none focus:ring-2 placeholder:tracking-normal placeholder:text-slate-300
                            ${pinForm.b && pinForm.a !== pinForm.b ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:ring-blue-100"}`}
                        />
                        {pinForm.b && pinForm.a !== pinForm.b && <p className="text-[11px] text-rose-500 mt-1">Los PINs no coinciden.</p>}
                        {coincide && !pinOK && (
                          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            PINs coinciden
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditPin(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 bg-white hover:bg-slate-50">
                          Cancelar
                        </button>
                        <button
                          onClick={() => savePin(med.id)}
                          disabled={!coincide}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-display uppercase tracking-wider ${coincide ? "text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                          style={coincide ? { background: grad } : {}}
                        >
                          {pinOK ? "✓ Guardado" : "Guardar PIN"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => borrarMedico(med.id)}
                  className="flex items-center gap-2 text-sm text-rose-500 border border-rose-200 rounded-xl px-3 py-2 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={14} /> Borrar médico
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-slate-200">
        {([
          ["guardias", "Guardias de hoy"],
          ["perfiles", "Perfiles"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${subTab === id ? "text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"}`}
            style={subTab === id ? { borderColor: R } : { borderColor: "transparent" }}
          >
            {label}
          </button>
        ))}
      </div>
      {subTab === "guardias" ? renderGuardias() : renderPerfiles()}
    </div>
  );
}
