import type { ReactNode } from "react";
import { R } from "../../lib/theme";

export function SecTitle({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <h3 className="font-display text-sm uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
      <span className="h-px w-6" style={{ background: `linear-gradient(to right,${R},transparent)` }} />
      {icon && <span className="inline -mt-0.5 mr-0.5">{icon}</span>}
      {children}
    </h3>
  );
}
