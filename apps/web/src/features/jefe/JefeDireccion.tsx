import { Asterisk, CheckCircle2, ChevronDown, Users, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { KpiCard } from "../../components/shared/KpiCard";
import { SecTitle } from "../../components/shared/SecTitle";
import { HOY } from "../../data/constants";
import { api } from "../../lib/api";
import { A, G, card } from "../../lib/theme";
import type { ChecklistsPM, Movil, Personal, Presencias } from "../../types";

function CheckR({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      {ok ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> : <XCircle size={14} className="text-rose-500 shrink-0" />}
      <span className={`text-sm ${ok ? "text-slate-600" : "text-rose-600"}`}>{label}</span>
    </div>
  );
}

export function JefeDireccion() {
  const [expand, setExpand] = useState<string | null>(null);
  const [checklists, setChecklists] = useState<ChecklistsPM>({});
  const [presencias, setPresencias] = useState<Presencias>({});
  const [moviles, setMoviles] = useState<Movil[]>([]);
  const [personal, setPersonal] = useState<Personal[]>([]);

  useEffect(() => {
    const load = async () => {
      setChecklists(await api.getChecklistsPM());
      setPresencias(await api.getPresencias());
    };
    const loadCatalogo = async () => {
      setMoviles(await api.moviles());
      setPersonal(await api.personal());
    };
    loadCatalogo();
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, []);

  const MOVILES_MED = ["531", "530", "527", "Kangoo"];

  // "Operativo" = el paramédico ya envió (no solo "se le asignó") el
  // checklist de hoy para ese móvil, y si corresponde médico, que haya
  // fichado presente hoy.
  const operativo = (movilId: string) => {
    const pmOk = Object.entries(checklists).some(([k, v]) => k.startsWith(`${HOY}:`) && v.movilFisico === movilId && v.enviado);
    const medOk = Object.entries(presencias).some(([k, v]) => k.endsWith(`:${HOY}`) && v.movil === movilId && v.confirmado);
    return MOVILES_MED.includes(movilId) ? pmOk && medOk : pmOk;
  };

  const activos = moviles.filter((m) => m.estado === "activo").length;
  const ops = moviles.filter((m) => operativo(m.id)).length;
  const presente = personal.filter((p) => p.estado === "presente").length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiCard label="En servicio" value={`${activos}/${moviles.length}`} color={A}>
          <Asterisk size={18} />
        </KpiCard>
        <KpiCard label="Operativos" value={`${ops}/${activos}`} color="#059669">
          <CheckCircle2 size={18} />
        </KpiCard>
        <KpiCard label="Personal hoy" value={`${presente}/${personal.length}`} color={G}>
          <Users size={18} />
        </KpiCard>
      </div>

      <section>
        <SecTitle icon={<Asterisk size={13} />}>Estado de la flota</SecTitle>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          {moviles.map((m) => {
            const op = operativo(m.id);
            const open = expand === m.id;
            const dotColor = op ? "bg-emerald-500" : m.estado === "activo" ? "bg-sky-400" : m.estado === "taller" ? "bg-amber-400" : "bg-rose-400";
            return (
              <div key={m.id} className={`${card} overflow-hidden`}>
                <button onClick={() => setExpand(open ? null : m.id)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                    <div>
                      <p className="font-display text-xl text-slate-800">
                        Móvil <span className="text-[#ED1C2E]">{m.id}</span> <span className="text-slate-400 text-base">· {m.nombre}</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        {m.km.toLocaleString("es-AR")} km · {m.ultimaRevision}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {op ? (
                      <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200">Operativo</span>
                    ) : (
                      <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border bg-slate-100 text-slate-500 border-slate-200">
                        {m.estado === "activo" ? "En servicio" : m.estado === "taller" ? "En taller" : "Inactivo"}
                      </span>
                    )}
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {open && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-semibold mb-1">Mecánica</p>
                        <CheckR ok={m.mecanica.aceite} label="Aceite" />
                        <CheckR ok={m.mecanica.agua} label="Agua" />
                        <CheckR ok={m.mecanica.frenos} label="Frenos" />
                        <CheckR ok={!m.mecanica.chocado} label={m.mecanica.chocado ? "Con daños" : "Sin daños"} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-semibold mb-1">Terapia</p>
                        <CheckR ok={m.electro.dea} label="DEA" />
                        <CheckR ok={m.electro.ciclador} label="Ciclador" />
                        <CheckR ok={m.oxigeno.cOk === m.oxigeno.c} label={`O₂ ${m.oxigeno.cOk}/${m.oxigeno.c}`} />
                        <CheckR ok={m.bolsos.paro && m.bolsos.via && m.bolsos.trauma && m.bolsos.maletin} label="Bolsos OK" />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                      <p>
                        <span className="font-semibold text-slate-700">Día:</span> {m.dotDia.para} / {m.dotDia.med}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">Noche:</span> {m.dotNoche.para}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SecTitle icon={<Users size={13} />}>Personal en guardia (RRHH)</SecTitle>
        <div className="grid gap-2 mt-3">
          {personal.map((p) => {
            const ec = p.estado === "presente" ? "text-emerald-600" : p.estado === "ausente" ? "text-rose-600" : "text-amber-600";
            const ed = p.estado === "presente" ? "bg-emerald-500" : p.estado === "ausente" ? "bg-rose-500" : "bg-amber-500";
            const el = p.estado === "presente" ? "Presente" : p.estado === "ausente" ? "Ausente" : "Tarde";
            return (
              <div key={p.id} className={`${card} p-4 grid grid-cols-2 sm:grid-cols-6 gap-3 items-center`}>
                <div className="col-span-2 flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${ed}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.nombre}</p>
                    <p className="text-xs text-slate-400">{p.rol}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500">{p.guardia}</div>
                <div className={`text-xs font-bold uppercase ${ec}`}>{el}</div>
                <div className="text-xs text-slate-500">
                  <span className="font-display text-base text-slate-800">{p.horas}</span> hs
                </div>
                <div className="flex gap-3 text-xs text-slate-500">
                  <span>
                    <span className="font-display text-base text-slate-800">{p.faltas}</span> faltas
                  </span>
                  <span>
                    <span className="font-display text-base text-slate-800">{p.tardes}</span> tardes
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
