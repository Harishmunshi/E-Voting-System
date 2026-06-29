export function BrandHeader({ eyebrow }: { eyebrow?: string }) {
  return (
    <header className="border-b-2 border-gold-600 bg-maroon-600 text-white shadow-soft">
      <div className="mx-auto flex min-h-[90px] max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <img
            src="/school-logo.png"
            alt="M.E.S. English Medium School logo"
            className="h-16 w-auto object-contain"
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-600">M.E.S.</p>
            <h1 className="text-base font-bold tracking-tight text-white sm:text-xl">English Medium School E-Voting Portal</h1>
          </div>
        </div>
        {eyebrow ? <p className="hidden text-sm font-semibold text-white/80 sm:block">{eyebrow}</p> : null}
      </div>
    </header>
  );
}
