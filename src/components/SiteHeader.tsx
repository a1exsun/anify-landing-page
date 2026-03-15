import { useContext, useEffect, useState } from "react";

import { NavContext } from "@/App";
import logoImg from "@/assets/ANIFY_logo.png";
import { smoothNavScrollToHash } from "@/lib/smoothNavScroll";

const NAV_PLAIN = [
  { href: "#features", label: "Features" },
  { href: "#highlights", label: "Highlights" },
  { href: "#roadmap", label: "Roadmap" },
] as const;

const navLinkClass =
  "rounded-md px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white/78 transition-colors hover:bg-amber-400/12 hover:text-amber-50 md:px-2.5";

const DISCORD_URL = "https://discord.gg/RMhmQ5GV";

const playGoldClass =
  "inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-300 to-amber-600 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-[#1a1208] shadow-[0_0_12px_-2px_rgba(251,191,36,0.45)] transition-transform hover:scale-[1.02] active:scale-[0.98] md:px-3 md:py-1.5";

const discordLinkClass =
  "ml-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200/18 text-white/90 transition-colors hover:border-[#5865F2] hover:bg-[#5865F2]/20 hover:text-white md:h-8 md:w-8";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01 10.2 10.2 0 0 0 .372.292.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

const anifyWordmarkClass =
  "font-wordmark font-semibold leading-none text-white";

function AnifyHomeLink({
  className,
  onNavigate,
  scrollToSection,
}: {
  className?: string;
  onNavigate?: () => void;
  scrollToSection: (hash: string) => void;
}) {
  return (
    <a
      href="#hero"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onNavigate?.();
        scrollToSection("#hero");
      }}
      aria-label="Anify"
    >
      <img
        src={logoImg}
        alt=""
        className="h-6 w-auto object-contain md:h-7"
      />
    </a>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigateToSection = useContext(NavContext);
  const scrollTo = navigateToSection ?? smoothNavScrollToHash;

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
          <AnifyHomeLink
            className={`relative hidden shrink-0 text-[1.05rem] md:block ${anifyWordmarkClass}`}
            scrollToSection={scrollTo}
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
                  scrollTo(href);
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
                scrollTo("#play");
              }}
            >
              Play
            </a>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={discordLinkClass}
              aria-label="Discord"
            >
              <DiscordIcon className="h-4 w-4" />
            </a>
          </nav>

          <div className="relative flex w-full min-h-8 items-center gap-2 md:hidden">
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-amber-200/18 bg-amber-400/10 text-amber-100"
              aria-expanded={menuOpen}
              aria-label="Open menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="block h-0.5 w-3.5 rounded-full bg-current" />
              <span className="block h-0.5 w-3.5 rounded-full bg-current" />
              <span className="block h-0.5 w-3.5 rounded-full bg-current" />
            </button>

            <div className="flex min-w-0 flex-1 justify-center px-1">
              <AnifyHomeLink
                className={`text-base ${anifyWordmarkClass} shrink-0 text-center`}
                scrollToSection={scrollTo}
              />
            </div>

            <a
              href="#play"
              className={`${playGoldClass} shrink-0 whitespace-nowrap`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#play");
              }}
            >
              Play
            </a>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={discordLinkClass}
              aria-label="Discord"
            >
              <DiscordIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        {menuOpen ? (
          <div
            className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-[101] rounded-2xl bg-gradient-to-b from-amber-200/20 to-amber-400/10 p-3 shadow-lg backdrop-blur-md md:hidden"
            style={{ WebkitBackdropFilter: "blur(14px)" }}
          >
            <nav className="flex flex-col gap-0.5" aria-label="Sections">
              {NAV_PLAIN.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-lg px-3 py-3 text-[0.95rem] font-medium text-white/90 active:bg-white/10"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    scrollTo(href);
                  }}
                >
                  {label}
                </a>
              ))}
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-[0.95rem] font-medium text-white/90 active:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                <DiscordIcon className="h-5 w-5" />
                Discord
              </a>
              <a
                href="#play"
                className="rounded-lg px-3 py-3 text-[0.95rem] font-medium text-amber-200 active:bg-white/10"
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  scrollTo("#play");
                }}
              >
                Play
              </a>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
