import { useEffect, useState } from "react";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#highlights", label: "Highlights" },
  { href: "#roadmap", label: "Roadmap" },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [menuOpen]);

  return (
    <header className="fixed left-0 right-0 top-0 z-[100] flex justify-center px-3 pt-[max(0.35rem,env(safe-area-inset-top))] md:px-4">
      <div
        className="flex w-full max-w-[min(42rem,calc(100%-1.5rem))] items-center gap-2 rounded-xl border border-amber-200/20 bg-gradient-to-b from-amber-200/14 via-amber-400/[0.07] to-amber-300/[0.05] px-2.5 py-1.5 shadow-[0_4px_20px_-6px_rgba(251,191,36,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md md:gap-3 md:px-3.5 md:py-1.5"
        style={{
          WebkitBackdropFilter: "blur(14px) saturate(1.1)",
          backdropFilter: "blur(14px) saturate(1.1)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-3 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-amber-200/45 to-transparent"
          aria-hidden
        />

        <a
          href="#hero"
          className="font-wordmark relative shrink-0 text-base font-semibold leading-none text-white md:text-[1.05rem]"
          style={{ letterSpacing: "0.02em" }}
        >
          Anify
        </a>

        <nav
          className="relative ml-auto hidden items-center gap-0 md:flex"
          aria-label="Section"
        >
          {NAV.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="rounded-md px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white/78 transition-colors hover:bg-amber-400/12 hover:text-amber-50 md:px-2.5"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="relative ml-auto flex items-center gap-1.5 md:ml-0">
          <button
            type="button"
            className="flex h-7 w-7 flex-col items-center justify-center gap-0.5 rounded-md border border-amber-200/22 bg-amber-400/10 text-amber-100 md:hidden"
            aria-expanded={menuOpen}
            aria-label="Menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="block h-0.5 w-3 rounded-full bg-current" />
            <span className="block h-0.5 w-3 rounded-full bg-current" />
            <span className="block h-0.5 w-3 rounded-full bg-current" />
          </button>
          <a
            href="#play"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-300 to-amber-600 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-[#1a1208] shadow-[0_0_12px_-2px_rgba(251,191,36,0.45)] transition-transform hover:scale-[1.02] active:scale-[0.98] md:px-3 md:py-1.5"
          >
            Start game
          </a>
        </div>
      </div>

      {menuOpen ? (
        <div
          className="absolute left-3 right-3 top-[calc(100%-0.25rem)] z-[101] mt-2 rounded-2xl border border-amber-200/20 bg-gradient-to-b from-amber-200/20 to-amber-400/10 p-3 shadow-lg backdrop-blur-md md:hidden"
          style={{ WebkitBackdropFilter: "blur(14px)" }}
        >
          <nav className="flex flex-col gap-0.5" aria-label="Section">
            <a
              href="#hero"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/90"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </a>
            {NAV.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/90"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <a
              href="#play"
              className="mt-1 rounded-lg bg-gradient-to-b from-amber-300 to-amber-600 px-3 py-2.5 text-center text-sm font-semibold text-[#1a1208]"
              onClick={() => setMenuOpen(false)}
            >
              Start game
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
