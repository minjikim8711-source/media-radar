export default function Header() {
  const now = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">K</span>
            </div>
            <div className="hidden sm:block h-5 w-px bg-slate-700" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100 leading-none">
              New Media Opportunity Radar
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">
              Marketing & BX Strategy Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[11px] text-slate-500 hidden md:block">{now}</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}
