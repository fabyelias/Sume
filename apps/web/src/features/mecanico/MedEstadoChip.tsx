const MAP = {
  ok: { l: "Vigente", c: "text-emerald-600" },
  por_vencer: { l: "Por vencer", c: "text-amber-600" },
  vencido: { l: "Vencido", c: "text-rose-600" },
} as const;

export function MedEstadoChip({ estado }: { estado: keyof typeof MAP }) {
  const m = MAP[estado];
  return <span className={`text-[11px] font-bold uppercase tracking-wide ${m.c}`}>{m.l}</span>;
}
