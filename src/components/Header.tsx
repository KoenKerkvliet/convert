export function Header() {
  return (
    <header className="border-b border-slate-200/60 bg-white/70 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="/" className="flex items-center gap-3">
          <img src="/favicon.svg" alt="Design Pixels" className="h-8 w-8" />
          <div className="flex flex-col leading-none">
            <span className="text-base font-semibold text-slate-900">ImageConverter</span>
            <span className="text-xs text-slate-500">by Design Pixels</span>
          </div>
        </a>
        <a
          href="https://designpixels.nl"
          target="_blank"
          rel="noreferrer"
          className="hidden text-sm font-medium text-slate-600 hover:text-brand sm:block"
        >
          designpixels.nl
        </a>
      </div>
    </header>
  );
}
