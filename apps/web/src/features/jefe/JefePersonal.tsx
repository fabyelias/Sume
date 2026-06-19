import { Plus, Trash2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { SecTitle } from "../../components/shared/SecTitle";
import { api } from "../../lib/api";
import { A, card, grad } from "../../lib/theme";
import type { Paramedico, Personal } from "../../types";

const PERSONAL_VACIO: Omit<Personal, "id"> = { nombre: "", rol: "Paramédico", guardia: "", estado: "presente", horas: 0, faltas: 0, tardes: 0 };

function SeccionParamedicos() {
  const [paramedicos, setParamedicos] = useState<Paramedico[]>([]);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [nombreEditado, setNombreEditado] = useState("");

  const recargar = () => api.paramedicos().then(setParamedicos);

  useEffect(() => {
    recargar();
  }, []);

  const crear = async () => {
    if (!nombreNuevo.trim()) return;
    setGuardando(true);
    await api.crearParamedico(nombreNuevo.trim());
    await recargar();
    setGuardando(false);
    setNombreNuevo("");
  };

  const guardarEdicion = async (nombreActual: string) => {
    if (!nombreEditado.trim() || nombreEditado.trim() === nombreActual) {
      setEditando(null);
      return;
    }
    await api.editarParamedico(nombreActual, nombreEditado.trim());
    await recargar();
    setEditando(null);
  };

  const borrar = async (nombre: string) => {
    await api.borrarParamedico(nombre);
    await recargar();
  };

  return (
    <section>
      <SecTitle>Paramédicos</SecTitle>
      <div className="grid gap-2 mt-3">
        <div className={`${card} p-3 flex gap-2`}>
          <input
            value={nombreNuevo}
            onChange={(e) => setNombreNuevo(e.target.value)}
            placeholder="Nombre (ej: L. Fernández)"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <button
            onClick={crear}
            disabled={!nombreNuevo.trim() || guardando}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-display uppercase tracking-wider text-white ${!nombreNuevo.trim() ? "bg-slate-200 text-slate-400" : ""}`}
            style={nombreNuevo.trim() ? { background: grad } : {}}
          >
            <Plus size={15} /> Agregar
          </button>
        </div>
        {paramedicos.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Todavía no hay paramédicos cargados.</p>}
        {paramedicos.map(({ nombre }) =>
          editando === nombre ? (
            <div key={nombre} className={`${card} p-3 flex gap-2`}>
              <input
                value={nombreEditado}
                onChange={(e) => setNombreEditado(e.target.value)}
                autoFocus
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button onClick={() => setEditando(null)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">
                Cancelar
              </button>
              <button
                onClick={() => guardarEdicion(nombre)}
                disabled={!nombreEditado.trim()}
                className="px-4 py-2 rounded-lg text-sm font-display uppercase tracking-wider text-white"
                style={{ background: grad }}
              >
                Guardar
              </button>
            </div>
          ) : (
            <div key={nombre} className={`${card} p-3 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm text-white shrink-0" style={{ background: A }}>
                  {nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <p className="text-sm font-semibold text-slate-800">{nombre}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setEditando(nombre);
                    setNombreEditado(nombre);
                  }}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  <Pencil size={14} className="text-slate-400" />
                </button>
                <button onClick={() => borrar(nombre)} className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50">
                  <Trash2 size={14} className="text-rose-400" />
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}

function SeccionRRHH() {
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [nuevo, setNuevo] = useState<Omit<Personal, "id"> | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Omit<Personal, "id">>(PERSONAL_VACIO);
  const [guardando, setGuardando] = useState(false);

  const recargar = () => api.personal().then(setPersonal);

  useEffect(() => {
    recargar();
  }, []);

  const crear = async () => {
    if (!nuevo?.nombre.trim()) return;
    setGuardando(true);
    await api.crearPersonal(nuevo);
    await recargar();
    setGuardando(false);
    setNuevo(null);
  };

  const guardarEdicion = async (id: number) => {
    await api.editarPersonal(id, editForm);
    await recargar();
    setEditId(null);
  };

  const borrar = async (id: number) => {
    await api.borrarPersonal(id);
    await recargar();
  };

  return (
    <section>
      <SecTitle>Personal (RRHH)</SecTitle>
      <div className="grid gap-2 mt-3">
        {!nuevo ? (
          <button
            onClick={() => setNuevo(PERSONAL_VACIO)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            <Plus size={16} /> Nuevo registro
          </button>
        ) : (
          <div className={`${card} p-4 space-y-3 border-l-4`} style={{ borderLeftColor: A }}>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={nuevo.nombre}
                onChange={(e) => setNuevo((f) => f && { ...f, nombre: e.target.value })}
                placeholder="Nombre"
                className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <input
                value={nuevo.rol}
                onChange={(e) => setNuevo((f) => f && { ...f, rol: e.target.value })}
                placeholder="Rol (Paramédico / Médico)"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <input
                value={nuevo.guardia}
                onChange={(e) => setNuevo((f) => f && { ...f, guardia: e.target.value })}
                placeholder="Guardia (ej: 07:00-19:00)"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <select
                value={nuevo.estado}
                onChange={(e) => setNuevo((f) => f && { ...f, estado: e.target.value as Personal["estado"] })}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="presente">Presente</option>
                <option value="ausente">Ausente</option>
                <option value="tarde">Tarde</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setNuevo(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">
                Cancelar
              </button>
              <button
                onClick={crear}
                disabled={!nuevo.nombre.trim() || guardando}
                className={`flex-1 py-2.5 rounded-xl text-sm font-display uppercase tracking-wider ${nuevo.nombre.trim() ? "text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                style={nuevo.nombre.trim() ? { background: grad } : {}}
              >
                {guardando ? "Guardando..." : "Crear"}
              </button>
            </div>
          </div>
        )}

        {personal.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Todavía no hay personal cargado.</p>}

        {personal.map((p) => {
          const editando = editId === p.id;
          const ec = p.estado === "presente" ? "text-emerald-600" : p.estado === "ausente" ? "text-rose-600" : "text-amber-600";
          const ed = p.estado === "presente" ? "bg-emerald-500" : p.estado === "ausente" ? "bg-rose-500" : "bg-amber-500";
          return (
            <div key={p.id} className={`${card} overflow-hidden`}>
              {!editando ? (
                <div className="p-4 grid grid-cols-2 sm:grid-cols-6 gap-3 items-center">
                  <div className="col-span-2 flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${ed}`} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{p.nombre}</p>
                      <p className="text-xs text-slate-400">{p.rol}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">{p.guardia}</div>
                  <div className={`text-xs font-bold uppercase ${ec}`}>{p.estado}</div>
                  <div className="text-xs text-slate-500">
                    <span className="font-display text-base text-slate-800">{p.horas}</span> hs
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => {
                        setEditId(p.id);
                        setEditForm({ nombre: p.nombre, rol: p.rol, guardia: p.guardia, estado: p.estado, horas: p.horas, faltas: p.faltas, tardes: p.tardes });
                      }}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                      <Pencil size={13} className="text-slate-400" />
                    </button>
                    <button onClick={() => borrar(p.id)} className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50">
                      <Trash2 size={13} className="text-rose-400" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={editForm.nombre}
                      onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))}
                      className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <input
                      value={editForm.rol}
                      onChange={(e) => setEditForm((f) => ({ ...f, rol: e.target.value }))}
                      placeholder="Rol"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <input
                      value={editForm.guardia}
                      onChange={(e) => setEditForm((f) => ({ ...f, guardia: e.target.value }))}
                      placeholder="Guardia"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <select
                      value={editForm.estado}
                      onChange={(e) => setEditForm((f) => ({ ...f, estado: e.target.value as Personal["estado"] }))}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                    >
                      <option value="presente">Presente</option>
                      <option value="ausente">Ausente</option>
                      <option value="tarde">Tarde</option>
                    </select>
                    <input
                      type="number"
                      value={editForm.horas}
                      onChange={(e) => setEditForm((f) => ({ ...f, horas: Number(e.target.value) }))}
                      placeholder="Horas"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <input
                      type="number"
                      value={editForm.faltas}
                      onChange={(e) => setEditForm((f) => ({ ...f, faltas: Number(e.target.value) }))}
                      placeholder="Faltas"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <input
                      type="number"
                      value={editForm.tardes}
                      onChange={(e) => setEditForm((f) => ({ ...f, tardes: Number(e.target.value) }))}
                      placeholder="Tardes"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">
                      Cancelar
                    </button>
                    <button onClick={() => guardarEdicion(p.id)} className="flex-1 py-2.5 rounded-xl text-sm font-display uppercase tracking-wider text-white" style={{ background: grad }}>
                      Guardar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function JefePersonal() {
  return (
    <div className="space-y-8">
      <SeccionParamedicos />
      <SeccionRRHH />
    </div>
  );
}
