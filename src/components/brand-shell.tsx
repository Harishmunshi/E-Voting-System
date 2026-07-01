export function BrandHeader({ eyebrow }: { eyebrow?: string }) {
  return (
    <header className="border-b border-gold-500/40 bg-maroon-900/95 text-maroon-50 shadow-soft backdrop-blur">
      <div className="mx-auto flex min-h-[96px] max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <img
            src="/school-logo.png"
            alt="M.E.S. English Medium School logo"
            className="h-16 w-auto object-contain drop-shadow-lg"
          />
          <div>
            <p className="bg-gradient-to-r from-gold-100 via-gold-500 to-maroon-50 bg-clip-text text-3xl font-black uppercase leading-none tracking-[0.16em] text-transparent sm:text-5xl">
              M.E.S.
            </p>
            <h1 className="mt-1 text-sm font-bold tracking-tight text-maroon-50 sm:text-xl">English Medium School E-Voting Portal</h1>
          </div>
        </div>
        {eyebrow ? <p className="hidden text-sm font-semibold text-maroon-100/80 sm:block">{eyebrow}</p> : null}
      </div>
    </header>
  );
}
