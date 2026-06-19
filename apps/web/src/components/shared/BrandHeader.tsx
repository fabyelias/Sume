import { ArrowLeft, Asterisk } from "lucide-react";
import { A, BG, R } from "../../lib/theme";

export function BrandHeader({ subtitle, onBack }: { subtitle: string; onBack?: () => void }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
        )}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: BG }}>
          <Asterisk size={22} style={{ color: A }} strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <p className="font-display text-2xl tracking-tight">
            <span style={{ color: R }}>SUME</span> <span style={{ color: A }}>SALUD</span>
          </p>
          <p className="text-[10px] text-slate-400 tracking-[0.4em] uppercase mt-0.5">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
