import { AlertCircle, ArrowLeft, CheckCircle2, Stethoscope, User } from "lucide-react";
import { useEffect, useState } from "react";
import { HOY } from "../../data/constants";
import { api } from "../../lib/api";
import { A, BG, R, card, fontImport, grad } from "../../lib/theme";
import type { GuardiaMedica, Medico, Presencia } from "../../types";

export function PanelMedicoPrincipal({ medico, onBack }: { medico: Medico; onBack: () => void }) {
  const [guardia, setGuardia] = useState<GuardiaMedica | null>(null);
  const [paramedicoOk, setParamedicoOk] = useState(false);
  const [presencia, setPresencia] = useState<Presencia | null>(null);
  const [pinMedico, setPinMedico] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const g = await api.getGuardiasMedicas();
      const k = `${medico.id}:${HOY}`;
      if (g[k]) setGuardia(g[k]);

      // El checklist del paramédico se considera "confirmado" cuando algún
      // paramédico envió (de verdad, no solo "se le asignó") el checklist
      // de hoy para este móvil.
      const checklists = await api.getChecklistsPM();
      const movilMedico = g[k]?.movilAsig || medico.movilFijo;
      const pmOk = Object.entries(checklists).some(([ck, v]) => ck.startsWith(`${HOY}:`) && v.movilFisico === movilMedico && v.enviado);
      setParamedicoOk(pmOk);

      const p = await api.getPresencias();
      const presKey = `${medico.id}:${HOY}`;
      if (p[presKey]) setPresencia(p[presKey]);
      else setPresencia(null);

      const pines = await api.getPines();
      if (pines[medico.id]) setPinMedico(pines[medico.id]);

      setCargando(false);
    };
    cargar();
    const iv = setInterval(cargar, 8000);
    return () => clearInterval(iv);
  }, [medico.id]);

  // Hora de ingreso esperada para hoy: la que fijó el Jefe para esta guardia
  // puntual, o si no se especificó, la del turno fijo del médico
  // ("07:00–19:00" → "07:00"). Móvil asignado no influye en el horario.
  const horaEsperada = (): string | null => {
    if (guardia?.horaIngreso) return guardia.horaIngreso;
    const match = medico.turno.match(/^(\d{1,2}:\d{2})/);
    return match ? match[1] : null;
  };

  const confirmarPresencia = async () => {
    if (!pinMedico || pin !== pinMedico) {
      setPinError(true);
      return;
    }
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    const movilHoy = guardia?.movilAsig || medico.movilFijo;

    let tarde = false;
    let minutosTarde = 0;
    const esperada = horaEsperada();
    if (esperada) {
      const [h, m] = esperada.split(":").map(Number);
      const limite = new Date(ahora);
      limite.setHours(h, m, 0, 0);
      const diff = Math.round((ahora.getTime() - limite.getTime()) / 60000);
      if (diff > 0) {
        tarde = true;
        minutosTarde = diff;
      }
    }

    // La llegada tarde solo se registra para que la vea el Jefe (panel
    // Médicos); acá no se le muestra nada distinto al médico ni afecta
    // el checklist del paramédico, son cosas separadas.
    const datos: Presencia = { confirmado: true, hora, movil: movilHoy, tarde, minutosTarde };
    setPresencia(datos);
    const todas = await api.getPresencias();
    todas[`${medico.id}:${HOY}`] = datos;
    await api.setPresencias(todas);

    // La guardia pasa de "pendiente" a "presente" para que el Jefe vea el
    // cambio reflejado también en Panel Jefe → Médicos → Guardias de hoy.
    const k = `${medico.id}:${HOY}`;
    const guardiasActuales = await api.getGuardiasMedicas();
    const nuevaGuardia = { ...guardiasActuales[k], estado: "presente" as const };
    guardiasActuales[k] = nuevaGuardia;
    setGuardia(nuevaGuardia);
    await api.setGuardiasMedicas(guardiasActuales);
  };

  const movilHoy = guardia?.movilAsig || medico.movilFijo;
  const turnoHoy = guardia?.horaIngreso ? `${guardia.horaIngreso} – ${guardia.horaFin || "—"}` : medico.turno;
  const operativo = presencia?.confirmado && paramedicoOk;

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <p className="text-slate-400 text-sm">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: BG, fontFamily: "Inter, sans-serif" }}>
      <style>{fontImport}</style>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-5 flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: BG }}>
            <Stethoscope size={20} style={{ color: A }} />
          </div>
          <div className="leading-tight">
            <p className="font-display text-2xl tracking-tight">
              <span style={{ color: R }}>SUME</span> <span style={{ color: A }}>SALUD</span>
            </p>
            <p className="text-[10px] text-slate-400 tracking-[0.4em] uppercase mt-0.5">Panel Médico · {medico.nombre}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-5">
        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-semibold">Tu guardia de hoy</p>
            {presencia?.confirmado ? (
              <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200">Confirmada</span>
            ) : (
              <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border bg-amber-50 text-amber-600 border-amber-200">Guardia pendiente</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400 mb-0.5">Móvil</p>
              <p className="font-display text-2xl" style={{ color: R }}>
                {movilHoy}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400 mb-0.5">Turno</p>
              <p className="font-semibold text-slate-800 text-sm">{turnoHoy}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400 mb-0.5">Especialidad</p>
              <p className="font-semibold text-slate-800 text-sm">{medico.especialidad}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400 mb-0.5">Contacto</p>
              <p className="font-semibold text-slate-800 text-sm">{medico.telefono}</p>
            </div>
          </div>
          {guardia?.traslado && (
            <div className="mt-3 rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
              <span className="font-bold">Traslado: </span>
              {guardia.traslado}
            </div>
          )}
        </div>

        <div className={`${card} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-semibold mb-3">Estado del Móvil {movilHoy}</p>
          <div className="space-y-2">
            <div className={`flex items-center justify-between p-3 rounded-xl border ${paramedicoOk ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60"}`}>
              <div className="flex items-center gap-2.5">
                {paramedicoOk ? <CheckCircle2 size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-amber-500" />}
                <span className="text-sm font-medium text-slate-700">Checklist del paramédico</span>
              </div>
              <span className={`text-[11px] font-bold uppercase ${paramedicoOk ? "text-emerald-600" : "text-amber-600"}`}>{paramedicoOk ? "Confirmado" : "Pendiente"}</span>
            </div>
            <div className={`flex items-center justify-between p-3 rounded-xl border ${presencia?.confirmado ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex items-center gap-2.5">
                {presencia?.confirmado ? <CheckCircle2 size={18} className="text-emerald-500" /> : <User size={18} className="text-slate-400" />}
                <span className="text-sm font-medium text-slate-700">Presencia del médico</span>
              </div>
              <span className={`text-[11px] font-bold uppercase ${presencia?.confirmado ? "text-emerald-600" : "text-slate-400"}`}>{presencia?.confirmado ? `Confirmada ${presencia.hora}` : "Pendiente"}</span>
            </div>
          </div>
          <div className={`mt-3 rounded-xl p-4 text-center border ${operativo ? "bg-emerald-50 border-emerald-200" : "bg-slate-100 border-slate-200"}`}>
            <p className={`font-display text-2xl ${operativo ? "text-emerald-600" : "text-slate-400"}`}>{operativo ? "🟢 Móvil Operativo" : "⏳ Aguardando confirmaciones"}</p>
            <p className="text-xs mt-1 text-slate-400">{operativo ? `Móvil ${movilHoy} listo para operar` : "Se necesita checklist + presencia del médico"}</p>
          </div>
        </div>

        {!presencia?.confirmado ? (
          <div className={`${card} p-5 space-y-4`}>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-semibold mb-1">Confirmá tu presencia</p>
              <p className="text-sm text-slate-500">Ingresá tu PIN para registrar tu ingreso a guardia.</p>
            </div>
            {!pinMedico ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700 text-center">
                <p className="font-bold mb-1">Sin PIN asignado</p>
                <p className="text-xs">El Jefe de Paramédicos aún no te asignó un PIN.</p>
              </div>
            ) : (
              <>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Tu PIN"
                  maxLength={8}
                  className={`w-full rounded-xl border p-3.5 text-2xl font-display text-slate-800 tracking-[0.5em] text-center placeholder:text-slate-300 placeholder:tracking-normal focus:outline-none focus:ring-2 ${pinError ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:ring-blue-100"}`}
                />
                {pinError && <p className="text-xs text-rose-500 text-center">PIN incorrecto. Intentá de nuevo.</p>}
                <button
                  onClick={confirmarPresencia}
                  disabled={pin.length < 4}
                  className={`w-full flex items-center justify-center gap-2 font-display uppercase tracking-[0.2em] text-sm py-4 rounded-xl transition-opacity ${pin.length >= 4 ? "text-white hover:opacity-90" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                  style={pin.length >= 4 ? { background: grad } : {}}
                >
                  <CheckCircle2 size={16} /> Confirmar presencia
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={`${card} p-5 border-l-4 border-emerald-400`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-50">
                <CheckCircle2 size={20} className="text-emerald-500" />
              </div>
              <div>
                <p className="font-display text-lg text-slate-800">Presencia confirmada</p>
                <p className="text-xs text-slate-400 mt-0.5">Registrado a las {presencia.hora}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
