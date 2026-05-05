import { StatsCounter } from './StatsCounter';

interface FooterProps {
  sessionCount: number;
}

export function Footer({ sessionCount }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-slate-200/60 bg-white/60 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <StatsCounter sessionCount={sessionCount} />
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <p>
            Ontwikkeld door{' '}
            <a
              href="https://designpixels.nl"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-brand hover:text-brand-600"
            >
              Design Pixels
            </a>
            . Alle conversies gebeuren lokaal in je browser.
          </p>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Design Pixels</p>
        </div>
      </div>
    </footer>
  );
}
