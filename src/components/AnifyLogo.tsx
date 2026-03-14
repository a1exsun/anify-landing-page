type AnifyLogoProps = {
  className?: string;
};

/** Logo placeholder + Anify wordmark on one row; sizes respect short viewports. */
export function AnifyLogo({ className = "" }: AnifyLogoProps) {
  return (
    <div
      className={`flex flex-row flex-nowrap items-center justify-center gap-4 sm:gap-5 md:gap-8 lg:gap-10 xl:gap-12 ${className}`}
      aria-label="Anify"
    >
      <div className="relative shrink-0">
        <div
          className="pointer-events-none absolute -inset-4 rounded-2xl opacity-60 blur-xl sm:-inset-5 md:-inset-6"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(140, 210, 255, 0.18), transparent 55%), radial-gradient(circle at 70% 70%, rgba(190, 160, 255, 0.1), transparent 50%)",
          }}
          aria-hidden
        />
        <div
          className="relative flex aspect-square w-[4.25rem] max-h-[min(18svh,7rem)] max-w-[min(18svh,7rem)] items-center justify-center rounded-xl sm:w-20 sm:max-h-[min(18svh,8rem)] sm:max-w-[min(18svh,8rem)] md:w-24 md:max-h-28 md:max-w-28 lg:w-32 lg:max-h-32 lg:max-w-32 xl:w-36 xl:max-h-36 xl:max-w-36"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.1), 0 12px 40px -16px rgba(0,0,0,0.45)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-1.5 rounded-lg border border-dashed border-white/[0.1]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{
              background:
                "conic-gradient(from 210deg, transparent 0deg, rgba(120,220,255,0.05) 60deg, transparent 120deg)",
            }}
            aria-hidden
          />
          <span className="relative text-[0.55rem] font-medium uppercase tracking-[0.24em] text-white/35">
            Logo
          </span>
        </div>
      </div>

      <span
        className="min-w-0 shrink leading-[0.9] text-white"
        style={{
          fontFamily: "var(--font-wordmark)",
          fontWeight: 600,
          letterSpacing: "0.02em",
          fontFeatureSettings: '"kern" 1, "liga" 1',
          color: "rgba(248, 250, 255, 0.98)",
          textShadow:
            "0 0 40px rgba(200, 220, 255, 0.08), 0 3px 24px rgba(0,0,0,0.4)",
          fontSize:
            "clamp(2.5rem, min(7.5vw + 0.5rem, 3.25rem + 5.5vmin), 8.75rem)",
        }}
      >
        Anify
      </span>
    </div>
  );
}
