import { useEffect, useState } from "react";

import { smoothNavScrollToHash } from "@/lib/smoothNavScroll";

const NAV_PLAIN = [
  { href: "#features", label: "Features" },
  { href: "#highlights", label: "Highlights" },
  { href: "#roadmap", label: "Roadmap" },
] as const;

const navLinkClass =
  "rounded-md px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white/78 transition-colors hover:bg-amber-400/12 hover:text-amber-50 md:px-2.5";

const playGoldClass =
  "inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-300 to-amber-600 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-[#1a1208] shadow-[0_0_12px_-2px_rgba(251,191,36,0.45)] transition-transform hover:scale-[1.02] active:scale-[0.98] md:px-3 md:py-1.5";

const anifyWordmarkClass =
  "font-wordmark font-semibold leading-none text-white";

function AnifyHomeLink({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <a
      href="#hero"
      className={className}
      style={{ letterSpacing: "0.02em" }}
      onClick={(e) => {
        e.preventDefault();
        onNavigate?.();
        smoothNavScrollToHash("#hero");
      }}
    >
      Anify
    </a>
  );
}

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
      <div className="relative w-full max-w-[min(40rem,calc(100%-1.5rem))]">
        <div
          className="flex w-full items-center gap-2 rounded-xl bg-gradient-to-b from-amber-200/14 via-amber-400/[0.07] to-amber-300/[0.05] px-2.5 py-1.5 shadow-[0_4px_20px_-6px_rgba(251,191,36,0.18)] backdrop-blur-md md:gap-3 md:px-3.5 md:py-1.5"
          style={{
            WebkitBackdropFilter: "blur(14px) saturate(1.1)",
            backdropFilter: "blur(14px) saturate(1.1)",
          }}
        >
          {/* 桌面：左 Anify + 右导航（主流顶栏） */}
          <AnifyHomeLink
            className={`relative hidden shrink-0 text-[1.05rem] md:block ${anifyWordmarkClass}`}
          />

          <nav
            className="relative ml-auto hidden flex-wrap items-center justify-end gap-x-0 gap-y-1 md:flex"
            aria-label="Section"
          >
            {NAV_PLAIN.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={navLinkClass}
                onClick={(e) => {
                  e.preventDefault();
                  smoothNavScrollToHash(href);
                }}
              >
                {label}
              </a>
            ))}
            <a
              href="#play"
              className={playGoldClass}
              onClick={(e) => {
                e.preventDefault();
                smoothNavScrollToHash("#play");
              }}
            >
              Play
            </a>
          </nav>

          {/* 手机：左菜单 | 中 Anify（= 回顶部）| 右 Play */}
          <div className="relative flex w-full min-h-8 items-center gap-2 md:hidden">
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-amber-200/18 bg-amber-400/10 text-amber-100"
              aria-expanded={menuOpen}
              aria-label="打开导航"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="block h-0.5 w-3.5 rounded-full bg-current" />
              <span className="block h-0.5 w-3.5 rounded-full bg-current" />
              <span className="block h-0.5 w-3.5 rounded-full bg-current" />
            </button>

            <div className="flex min-w-0 flex-1 justify-center px-1">
              <AnifyHomeLink
                className={`text-base ${anifyWordmarkClass} shrink-0 text-center`}
              />
            </div>

            <a
              href="#play"
              className={`${playGoldClass} shrink-0 whitespace-nowrap`}
              onClick={(e) => {
                e.preventDefault();
                smoothNavScrollToHash("#play");
              }}
            >
              Play
            </a>
          </div>
        </div>

        {menuOpen ? (
          <div
            className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-[101] rounded-2xl bg-gradient-to-b from-amber-200/20 to-amber-400/10 p-3 shadow-lg backdrop-blur-md md:hidden"
            style={{ WebkitBackdropFilter: "blur(14px)" }}
          >
            <nav className="flex flex-col gap-0.5" aria-label="页面章节">
              {NAV_PLAIN.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-lg px-3 py-3 text-[0.95rem] font-medium text-white/90 active:bg-white/10"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    smoothNavScrollToHash(href);
                  }}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
