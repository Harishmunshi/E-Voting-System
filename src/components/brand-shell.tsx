export function BrandHeader({ eyebrow }: { eyebrow?: string }) {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img
            src="/school-logo.svg"
            alt="M.E.S. English Medium School logo"
            className="h-12 w-12 rounded-lg object-contain"
          />
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
