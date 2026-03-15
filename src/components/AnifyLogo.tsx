type AnifyLogoProps = {
  className?: string;
};

/** Anify wordmark for Hero; sizes respect short viewports. */
export function AnifyLogo({ className = "" }: AnifyLogoProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      aria-label="Anify"
    >
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
