import { ShieldCheck } from "lucide-react";

export function BrandHeader({ eyebrow }: { eyebrow?: string }) {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-royal-700 text-white">
            <ShieldCheck size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">M.E.S.</p>
            <h1 className="text-base font-bold text-slate-950 sm:text-lg">English Medium School E-Voting</h1>
          </div>
        </div>
        {eyebrow ? <p className="hidden text-sm font-medium text-slate-500 sm:block">{eyebrow}</p> : null}
      </div>
    </header>
  );
}
