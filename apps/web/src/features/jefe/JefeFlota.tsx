import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SecTitle } from "../../components/shared/SecTitle";
import { api } from "../../lib/api";
import { R, card, grad } from "../../lib/theme";
import type { Movil } from "../../types";

type MovilForm = { id: string; nombre: string; estado: Movil["estado"]; km: number };
const MOVIL_VACIO: MovilForm = { id: "", nombre: "", estado: "activo", km: 0 };

const ESTADOS: { id: Movil["estado"]; label: string }[] = [
  { id: "activo", label: "En servicio" },
  { id: "taller", label: "En taller" },
  { id: "inactivo", label: "Inactivo" },
];

export function JefeFlota() {
  const [moviles, setMoviles] = useState<Movil[]>([]);
  const [nuevo, setNuevo] = useState<MovilForm | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MovilForm>(MOVIL_VACIO);
  const [guardando, setGuardando] = useState(false);

  const recargar = () => api.moviles().then(setMoviles);

  useEffect(() => {
    recargar();
  }, []);

  const crear = async () => {
    if (!nuevo?.id.trim() || !nuevo.nombre.trim()) return;
    setGuardando(true);
    await api.crearMovil(nuevo);
    await recargar();
    setGuardando(false);
    setNuevo(null);
  };

  const guardarEdicion = async (id: string) => {
    if (!editForm.id.trim()) return;
    await api.editarMovil(id, { id: editForm.id.trim(), nombre: editForm.nombre, estado: editForm.estado, km: editForm.km });
    await recargar();
    setEditId(null);
  };

  const borrar = async (id: string) => {
    await api.borrarMovil(id);
    await recargar();
  };

  return (
    <div className="space-y-4">
      <SecTitle>Flota de móviles</SecTitle>
      <div className="grid gap-2">
        {!nuevo ? (
          <button
            onClick={() => setNuevo(MOVIL_VACIO)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            <Plus size={16} /> Nuevo móvil
          </button>
        ) : (
          <div className={`${card} p-4 space-y-3 border-l-4`} style={{ borderLeftColor: R }}>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={nuevo.id}
                onChange={(e) => setNuevo((f) => f && { ...f, id: e.target.value })}
                placeholder="Número de móvil (ej: 538)"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <input
                value={nuevo.nombre}
                onChange={(e) => setNuevo((f) => f && { ...f, nombre: e.target.value })}
                placeholder="Nombre (ej: Unidad Avanzada)"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <select
                value={nuevo.estado}
                onChange={(e) => setNuevo((f) => f && { ...f, estado: e.target.value as Movil["estado"] })}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
              >
                {ESTADOS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={nuevo.km}
                onChange={(e) => setNuevo((f) => f && { ...f, km: Number(e.target.value) })}
                placeholder="Kilometraje"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setNuevo(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">
                Cancelar
              </button>
              <button
                onClick={crear}
                disabled={!nuevo.id.trim() || !nuevo.nombre.trim() || guardando}
                className={`flex-1 py-2.5 rounded-xl text-sm font-display uppercase tracking-wider ${nuevo.id.trim() && nuevo.nombre.trim() ? "text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                style={nuevo.id.trim() && nuevo.nombre.trim() ? { background: grad } : {}}
              >
                {guardando ? "Guardando..." : "Crear móvil"}
              </button>
            </div>
          </div>
        )}

        {moviles.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Todavía no hay móviles cargados.</p>}

        {moviles.map((m) => {
          const editando = editId === m.id;
          return (
            <div key={m.id} className={`${card} overflow-hidden`}>
              {!editando ? (
                <div className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-xl text-slate-800">
                      Móvil <span style={{ color: R }}>{m.id}</span> <span className="text-slate-400 text-base">· {m.nombre}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {m.km.toLocaleString("es-AR")} km · {m.estado === "activo" ? "En servicio" : m.estado === "taller" ? "En taller" : "Inactivo"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditId(m.id);
                        setEditForm({ id: m.id, nombre: m.nombre, estado: m.estado, km: m.km });
                      }}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                      <Pencil size={14} className="text-slate-400" />
                    </button>
                    <button onClick={() => borrar(m.id)} className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50">
                      <Trash2 size={14} className="text-rose-400" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={editForm.id}
                      onChange={(e) => setEditForm((f) => ({ ...f, id: e.target.value }))}
                      placeholder="Número de móvil"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <input
                      value={editForm.nombre}
                      onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))}
                      placeholder="Nombre"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <select
                      value={editForm.estado}
                      onChange={(e) => setEditForm((f) => ({ ...f, estado: e.target.value as Movil["estado"] }))}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                    >
                      {ESTADOS.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={editForm.km}
                      onChange={(e) => setEditForm((f) => ({ ...f, km: Number(e.target.value) }))}
                      placeholder="Kilometraje"
                      className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">
                      Cancelar
                    </button>
                    <button
                      onClick={() => guardarEdicion(m.id)}
                      disabled={!editForm.id.trim()}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-display uppercase tracking-wider ${editForm.id.trim() ? "text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                      style={editForm.id.trim() ? { background: grad } : {}}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
