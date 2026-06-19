import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Droplet,
  Gauge,
  Heart,
  Lock,
  LogOut,
  Megaphone,
  Package,
  PlusCircle,
  Send,
  Wind,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SecTitle } from "../../components/shared/SecTitle";
import { api } from "../../lib/api";
import { A, R, card, grad } from "../../lib/theme";
import type { Base, CategoriaReporte, Reporte } from "../../types";
import { ChecklistItemPM, type DetallePM } from "./ChecklistItemPM";

const ITEM_KEYS = [
  "chocado", "aceite", "agua", "frenos", "embrague", "cubiertas",
  "electro", "dyne", "ciclador", "aspirador", "via", "paro", "maletin", "trauma",
] as const;
type ItemKey = (typeof ITEM_KEYS)[number];

const PLACEHOLDERS_PM: Record<ItemKey, string> = {
  chocado: "Describí el choque o daño: dónde, qué pasó, gravedad...",
  aceite: "Ej: nivel de aceite por debajo del mínimo, le faltan ~2cm en la varilla",
  agua: "Ej: nivel de refrigerante bajo, pierde agua por...",
  frenos: "Ej: frenos hacen ruido / pedal se hunde / tardan en responder",
  embrague: "Ej: embrague patina / cuesta engranar / pedal duro",
  cubiertas: "Ej: cubierta delantera derecha gastada, lona visible",
  electro: "Ej: electrocardiógrafo no enciende / no imprime / electrodos rotos",
  dyne: "Ej: DEA no carga / batería baja / parches vencidos",
  ciclador: "Ej: ciclador no enciende / pierde presión / falta tubuladura",
  aspirador: "Ej: aspirador sin succión / batería no carga",
  via: "Ej: falta suero, faltan branulas, etc.",
  paro: "Ej: falta tal medicación o insumo del bolso de paro",
  maletin: "Ej: falta tensiómetro / estetoscopio / insumos del maletín",
  trauma: "Ej: faltan vendas, collares cervicales, férulas, etc.",
};

function buildInitialPM() {
  const ok = {} as Record<ItemKey, boolean>;
  const detalle = {} as Record<ItemKey, DetallePM>;
  ITEM_KEYS.forEach((k) => {
    ok[k] = true;
    detalle[k] = { texto: "", foto: false };
  });
  return { ok, detalle };
}

// A qué categoría de reporte mapea cada ítem del checklist si se marca con falla.
const CATEGORIA_ITEM: Record<ItemKey, CategoriaReporte> = {
  chocado: "mecanica", aceite: "mecanica", agua: "mecanica", frenos: "mecanica", embrague: "mecanica", cubiertas: "mecanica",
  electro: "otro", dyne: "otro", ciclador: "otro", aspirador: "otro",
  via: "medicacion", paro: "medicacion", maletin: "medicacion", trauma: "medicacion",
};

const ESTADO_REPORTE_LABEL: Record<string, string> = { abierto: "Pendiente", en_proceso: "En proceso", resuelto: "Resuelto" };

export function PMChecklist({ base, movilFisico, nombreParamedico }: { base: Base; movilFisico: string; nombreParamedico: string }) {
  const [{ ok, detalle }, setState] = useState(buildInitialPM());
  const [oxigeno, setOxigeno] = useState({ centrales: 2, centralesOk: 2, manuales: 2, manualesOk: 2 });
  const [km, setKm] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [nuevaNovedad, setNuevaNovedad] = useState<{ categoria: CategoriaReporte; texto: string; foto: boolean }>({ categoria: "mecanica", texto: "", foto: false });
  const [enviandoNovedad, setEnviandoNovedad] = useState(false);
  const [mostrarCierre, setMostrarCierre] = useState(false);
  const [pin, setPin] = useState("");
  const [firmado, setFirmado] = useState(false);
  const [horaCierre, setHoraCierre] = useState<string | null>(null);
  const PIN_CORRECTO = "1234";

  useEffect(() => {
    if (!enviado) return;
    const load = () => api.reportes({ movilId: movilFisico }).then(setReportes);
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, [enviado, movilFisico]);

  const toggle = (key: ItemKey) => setState((prev) => ({ ...prev, ok: { ...prev.ok, [key]: !prev.ok[key] } }));
  const setDetalle = (key: ItemKey, val: DetallePM) => setState((prev) => ({ ...prev, detalle: { ...prev.detalle, [key]: val } }));
  const pendientes = ITEM_KEYS.filter((k) => !ok[k] && (!detalle[k].texto || !detalle[k].foto));
  const puedeEnviar = pendientes.length === 0 && km.trim() !== "";

  const Item = (props: { k: ItemKey; label: string; icon: React.ReactNode }) => (
    <ChecklistItemPM
      label={props.label}
      icon={props.icon}
      ok={ok[props.k]}
      onToggle={() => toggle(props.k)}
      detalle={detalle[props.k]}
      onDetalleChange={(val) => setDetalle(props.k, val)}
      placeholder={PLACEHOLDERS_PM[props.k]}
      locked={enviado}
    />
  );

  const StepperO2 = ({ label, value, total, onChange }: { label: string; value: number; total: number; onChange: (v: number) => void }) => (
    <div className={`${card} p-4 ${enviado ? "opacity-80" : ""}`}>
      <p className="text-sm text-slate-500 mb-2">{label}</p>
      <div className="flex items-center justify-between">
        <button onClick={() => onChange(Math.max(0, value - 1))} disabled={enviado} className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 text-lg font-bold hover:bg-slate-50">
          −
        </button>
        <p className="font-display text-2xl text-slate-800">
          {value}
          <span className="text-slate-400">/{total}</span>
        </p>
        <button onClick={() => onChange(Math.min(total, value + 1))} disabled={enviado} className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 text-lg font-bold hover:bg-slate-50">
          +
        </button>
      </div>
      <p className="text-[11px] text-slate-400 mt-2 uppercase tracking-wide font-semibold">{value === total ? "Completo" : "Incompleto"}</p>
    </div>
  );

  const confirmarGuardia = async () => {
    if (!puedeEnviar) return;
    setEnviado(true);
    // Cada ítem marcado con falla se reporta de una: lo ven en vivo el Jefe
    // (tab Mecánica) y el Mecánico (tab Reportes), que pueden responder.
    await Promise.all(
      ITEM_KEYS.filter((k) => !ok[k]).map((k) =>
        api.crearReporte({ movilId: movilFisico, categoria: CATEGORIA_ITEM[k], texto: detalle[k].texto, foto: detalle[k].foto, autor: nombreParamedico }),
      ),
    );
  };

  const reportarNovedad = async () => {
    if (!nuevaNovedad.texto.trim()) return;
    setEnviandoNovedad(true);
    await api.crearReporte({ movilId: movilFisico, categoria: nuevaNovedad.categoria, texto: nuevaNovedad.texto.trim(), foto: nuevaNovedad.foto, autor: nombreParamedico });
    setReportes(await api.reportes({ movilId: movilFisico }));
    setNuevaNovedad({ categoria: "mecanica", texto: "", foto: false });
    setEnviandoNovedad(false);
  };

  const confirmarCierre = async () => {
    if (pin !== PIN_CORRECTO) return;
    const hora = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    setFirmado(true);
    setHoraCierre(hora);
    const cierresActuales = await api.getCierres();
    cierresActuales[nombreParamedico] = { firmado: true, hora, movil: movilFisico, base: base.label, km, novedades: reportes.length };
    await api.setCierres(cierresActuales);
  };

  return (
    <div className="space-y-7">
      <div className={`${card} p-4 border-l-4 flex items-center justify-between`} style={{ borderLeftColor: A }}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-semibold mb-1">Guardia activa</p>
          <p className="text-sm font-semibold text-slate-800">
            {base.label} <span className="font-normal text-slate-400">·</span> Móvil <span style={{ color: R }}>{movilFisico}</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{base.turno}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: `${A}14`, color: A }}>
          <Lock size={12} /> Asignación fija
        </div>
      </div>

      <div className={`${card} p-4`}>
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-2 font-semibold flex items-center gap-1.5">
          <Gauge size={13} /> Kilometraje al tomar la guardia
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            disabled={enviado}
            placeholder="Ej: 128430"
            className={`flex-1 rounded-lg border p-3 text-lg font-display text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 ${enviado ? "border-slate-100 bg-slate-50 text-slate-400" : "border-slate-200"}`}
          />
          <span className="text-sm text-slate-400 font-semibold">km</span>
        </div>
      </div>

      <section className="space-y-2">
        <SecTitle icon={<Gauge size={13} />}>Mecánica del Móvil {movilFisico}</SecTitle>
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          <Item k="chocado" label="Sin choques ni daños nuevos" icon={<AlertTriangle size={16} className="text-slate-400" />} />
          <Item k="aceite" label="Nivel de aceite" icon={<Droplet size={16} className="text-slate-400" />} />
          <Item k="agua" label="Nivel de agua / refrigerante" icon={<Droplet size={16} className="text-slate-400" />} />
          <Item k="frenos" label="Frenos" icon={<Gauge size={16} className="text-slate-400" />} />
          <Item k="embrague" label="Embrague" icon={<Gauge size={16} className="text-slate-400" />} />
          <Item k="cubiertas" label="Cubiertas en buen estado" icon={<Gauge size={16} className="text-slate-400" />} />
        </div>
      </section>

      <section className="space-y-2">
        <SecTitle icon={<Heart size={13} />}>Terapia del Móvil {movilFisico}</SecTitle>
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          <Item k="electro" label="Electrocardiógrafo" icon={<Activity size={16} className="text-slate-400" />} />
          <Item k="dyne" label="DEA / Dyne" icon={<Heart size={16} className="text-slate-400" />} />
          <Item k="ciclador" label="Ciclador / respirador" icon={<Activity size={16} className="text-slate-400" />} />
          <Item k="aspirador" label="Aspirador" icon={<Wind size={16} className="text-slate-400" />} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <StepperO2 label="Tubos centrales" value={oxigeno.centralesOk} total={oxigeno.centrales} onChange={(v) => setOxigeno((p) => ({ ...p, centralesOk: v }))} />
          <StepperO2 label="Tubos manuales" value={oxigeno.manualesOk} total={oxigeno.manuales} onChange={(v) => setOxigeno((p) => ({ ...p, manualesOk: v }))} />
        </div>
      </section>

      <section className="space-y-2">
        <SecTitle icon={<Package size={13} />}>Bolsos y maletines</SecTitle>
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          <Item k="via" label="Bolso de vía completo" icon={<Package size={16} className="text-slate-400" />} />
          <Item k="paro" label="Bolso de paro completo" icon={<Package size={16} className="text-slate-400" />} />
          <Item k="maletin" label="Maletín del médico completo" icon={<Package size={16} className="text-slate-400" />} />
          <Item k="trauma" label="Bolso de trauma completo" icon={<Package size={16} className="text-slate-400" />} />
        </div>
      </section>

      <button
        onClick={confirmarGuardia}
        disabled={!puedeEnviar || enviado}
        className={`w-full flex items-center justify-center gap-2 font-display uppercase tracking-[0.2em] text-sm py-4 rounded-xl transition-opacity
          ${enviado ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : puedeEnviar ? "text-white hover:opacity-90" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
        style={!enviado && puedeEnviar ? { background: grad } : {}}
      >
        {enviado ? <Lock size={16} /> : <Send size={16} />}
        {enviado ? `✓ Guardia confirmada · ${base.label} · Móvil ${movilFisico}` : puedeEnviar ? "Confirmar toma de guardia" : "Faltan datos"}
      </button>

      {enviado && (
        <section className="space-y-3">
          <SecTitle icon={<Megaphone size={13} />}>Novedades durante la guardia</SecTitle>
          <p className="text-sm text-slate-500">Si ocurre algo durante la guardia, reportalo acá. Se ve en vivo en el panel del Jefe y del Mecánico, y acá vas a ver si ya lo resolvieron.</p>
          {reportes.length > 0 && (
            <div className="space-y-2">
              {reportes.map((rep) => (
                <div key={rep.id} className={`${card} p-3.5`}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                      style={{
                        background: rep.categoria === "mecanica" ? `${R}14` : rep.categoria === "medicacion" ? "#D9770614" : `${A}14`,
                        color: rep.categoria === "mecanica" ? R : rep.categoria === "medicacion" ? "#D97706" : A,
                      }}
                    >
                      {rep.categoria === "mecanica" ? "Mecánica" : rep.categoria === "medicacion" ? "Medicación / insumos" : "Otro"}
                    </span>
                    <span
                      className={`text-[11px] font-bold uppercase ${rep.estado === "resuelto" ? "text-emerald-600" : rep.estado === "en_proceso" ? "text-amber-600" : "text-slate-400"}`}
                    >
                      {ESTADO_REPORTE_LABEL[rep.estado]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{rep.texto}</p>
                  {rep.foto && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                      <Camera size={12} /> Foto adjunta
                    </div>
                  )}
                  {rep.respuesta && (
                    <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 p-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600 mb-0.5">Taller / Mecánico</p>
                      <p className="text-sm text-slate-700">{rep.respuesta}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className={`${card} p-4 space-y-2`}>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-semibold">Reportar novedad nueva</p>
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  { id: "mecanica", label: "Mecánica" },
                  { id: "medicacion", label: "Medicación / insumos" },
                  { id: "otro", label: "Otro" },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setNuevaNovedad((p) => ({ ...p, categoria: c.id }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${nuevaNovedad.categoria === c.id ? "border-transparent text-white" : "border-slate-200 text-slate-500"}`}
                  style={nuevaNovedad.categoria === c.id ? { background: A } : {}}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <textarea
              value={nuevaNovedad.texto}
              onChange={(e) => setNuevaNovedad((p) => ({ ...p, texto: e.target.value }))}
              placeholder="Contá qué pasó..."
              rows={2}
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              onClick={() => setNuevaNovedad((p) => ({ ...p, foto: !p.foto }))}
              className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 w-full justify-center border transition-colors ${nuevaNovedad.foto ? "border-blue-300 bg-blue-50 text-blue-700" : "border-dashed border-slate-300 text-slate-500 hover:bg-slate-50"}`}
            >
              <Camera size={15} /> {nuevaNovedad.foto ? "Foto adjuntada ✓" : "Adjuntar foto (opcional)"}
            </button>
            <button
              onClick={reportarNovedad}
              disabled={!nuevaNovedad.texto.trim() || enviandoNovedad}
              className={`w-full flex items-center justify-center gap-2 font-display uppercase tracking-[0.2em] text-sm py-3 rounded-xl transition-opacity ${nuevaNovedad.texto.trim() ? "text-white hover:opacity-90" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
              style={nuevaNovedad.texto.trim() ? { background: R } : {}}
            >
              <PlusCircle size={16} /> {enviandoNovedad ? "Enviando..." : "Reportar novedad"}
            </button>
          </div>
        </section>
      )}

      {enviado && !firmado && (
        <section className="space-y-3 pt-2">
          <div className="h-px w-full bg-slate-200" />
          <SecTitle icon={<Lock size={13} />}>Cierre de guardia</SecTitle>
          {!mostrarCierre ? (
            <button
              onClick={() => setMostrarCierre(true)}
              className="w-full flex items-center justify-center gap-2 font-display uppercase tracking-[0.2em] text-sm py-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-colors"
            >
              <LogOut size={16} /> Cerrar guardia y firmar entrega
            </button>
          ) : (
            <div className={`${card} p-5 space-y-4`}>
              <p className="text-sm text-slate-600">
                Al firmar, confirmás que el móvil queda entregado en las condiciones reportadas, incluyendo {reportes.length > 0 ? `${reportes.length} novedad(es)` : "sin novedades adicionales"}.
              </p>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-semibold mb-2">Tu PIN de firma</p>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Ingresá tu PIN"
                  maxLength={6}
                  className="w-full rounded-lg border border-slate-200 p-3 text-lg font-display text-slate-800 tracking-[0.3em] placeholder:text-slate-300 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                {pin && pin !== PIN_CORRECTO && pin.length >= 4 && <p className="text-[11px] text-rose-500 mt-1">PIN incorrecto.</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMostrarCierre(false);
                    setPin("");
                  }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarCierre}
                  disabled={pin !== PIN_CORRECTO}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-display uppercase tracking-wider ${pin === PIN_CORRECTO ? "text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                  style={pin === PIN_CORRECTO ? { background: A } : {}}
                >
                  <CheckCircle2 size={16} /> Firmar entrega
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {firmado && (
        <div className={`${card} p-5 border-l-4 border-emerald-400`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-emerald-50">
              <CheckCircle2 size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="font-display text-lg text-slate-800">Guardia cerrada y firmada</p>
              <p className="text-xs text-slate-400">Registrado a las {horaCierre} · visible en panel del Jefe</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
