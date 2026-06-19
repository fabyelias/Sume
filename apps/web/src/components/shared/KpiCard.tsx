import type { ReactNode } from "react";
import { card } from "../../lib/theme";

export function KpiCard({
  label,
  value,
  color,
  children,
}: {
  label: string;
  value: string | number;
  color: string;
  children: ReactNode;
}) {
  return (
    <div className={`${card} p-4`}>
      <div className="inline-flex p-2 rounded-lg mb-3" style={{ color, background: `${color}18` }}>
        {children}
      </div>
      <p className="font-display text-3xl text-slate-800 leading-none">{value}</p>
      <p className="text-xs text-slate-500 mt-1.5">{label}</p>
    </div>
  );
}
