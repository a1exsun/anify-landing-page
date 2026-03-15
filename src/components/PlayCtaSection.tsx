import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { PlayLandingBackground } from "@/components/PlayLandingBackground";

gsap.registerPlugin(ScrollTrigger);

const PLAY_URL = "https://preview.anify.ai/";

function LandingSparkles({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{
        filter:
          "drop-shadow(0 0 8px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 16px rgba(251, 191, 36, 0.4))",
      }}
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}

const headingStyle = {
  fontFamily: "Georgia, serif",
  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutQuad = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export function PlayCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const bg = bgRef.current;
    const icon = iconRef.current;
    const content = contentRef.current;
    if (!section || !stage || !bg || !icon || !content) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      bg.style.removeProperty("--play-cutout-size");
      bg.style.removeProperty("--play-cutout-x");
      bg.style.removeProperty("--play-cutout-y");
      gsap.set(bg, { opacity: 1 });
      gsap.set(icon, { opacity: 1, scale: 1 });
      gsap.set(content, { opacity: 1, y: 0, filter: "none" });
      return;
    }

    const apply = (raw: number) => {
      const p = clamp01(raw);
      const phase = p;
      const stageRect = stage.getBoundingClientRect();
      const iconRect = icon.getBoundingClientRect();
      const toX = iconRect.left - stageRect.left + iconRect.width / 2;
      const toY = iconRect.top - stageRect.top + iconRect.height / 2;
      const fromX = stageRect.width * 0.5;
      const fromY = stageRect.height * 0.5;

      const holeMoveT = easeOutExpo(clamp01(phase / 0.62));
      const holeCloseT = easeOutExpo(clamp01((phase - 0.62) / 0.16));
      const iconRevealT = easeOutExpo(clamp01((phase - 0.36) / 0.09));
      const contentRevealT = easeOutExpo(clamp01((phase - 0.44) / 0.1));

      const centerX = fromX + (toX - fromX) * holeMoveT;
      const centerY = fromY + (toY - fromY) * holeMoveT;
      const maxCoverSize = Math.hypot(stageRect.width, stageRect.height) * 2.2;
      const settledSize = Math.min(stageRect.width * 0.24, 220);
      const movingSize = maxCoverSize + (settledSize - maxCoverSize) * holeMoveT;
      const activeSize = Math.max(6, movingSize * (1 - holeCloseT));
      const cutoutX = centerX - activeSize / 2;
      const cutoutY = centerY - activeSize / 2;

      bg.style.setProperty("--play-cutout-size", `${activeSize}px`);
      bg.style.setProperty("--play-cutout-x", `${cutoutX}px`);
      bg.style.setProperty("--play-cutout-y", `${cutoutY}px`);

      const bgAlpha = easeInOutQuad(clamp01(phase / 0.94));
      gsap.set(bg, { opacity: bgAlpha });
      gsap.set(icon, {
        opacity: iconRevealT,
        scale: 1.1 - 0.1 * iconRevealT,
        filter: iconRevealT < 0.98 ? `blur(${4 * (1 - iconRevealT)}px)` : "none",
      });
      gsap.set(content, {
        opacity: contentRevealT,
        y: (1 - contentRevealT) * 24,
        filter:
          contentRevealT < 0.995
            ? `blur(${6 * (1 - contentRevealT)}px)`
            : "none",
      });
    };

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * 1.35)}`,
      pin: stage,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 0.65,
      invalidateOnRefresh: true,
      onUpdate: (self) => apply(self.progress),
    });

    apply(st.progress);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      st.kill();
      bg.style.removeProperty("--play-cutout-size");
      bg.style.removeProperty("--play-cutout-x");
      bg.style.removeProperty("--play-cutout-y");
      gsap.set(bg, { clearProps: "opacity" });
      gsap.set(icon, { clearProps: "opacity,transform,filter" });
      gsap.set(content, { clearProps: "opacity,transform,filter" });
    };
  }, []);

  return (
    <section
      id="play"
      ref={sectionRef}
      className="relative isolate w-full min-w-0"
    >
      <div
        ref={stageRef}
        className="flex min-h-[100dvh] w-full items-center justify-center overflow-hidden px-5 py-[max(3rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] md:px-10 md:py-24"
      >
        <div
          ref={bgRef}
          className="play-cta-cutout-bg pointer-events-none absolute inset-0 z-0 bg-[#0a0a0f] opacity-0"
          aria-hidden
        >
          <PlayLandingBackground />
        </div>

        <div
          className="relative z-10 flex w-full max-w-lg flex-col items-center text-center md:max-w-xl"
        >
          <div
            ref={iconRef}
            className="text-amber-400 opacity-0 will-change-transform"
          >
            <LandingSparkles className="mx-auto h-12 w-12 md:h-14 md:w-14" />
          </div>

          <div
            ref={contentRef}
            className="mt-8 flex flex-col items-center opacity-0"
          >
            <p
              className="max-w-md text-2xl font-bold leading-snug tracking-tight text-white md:max-w-lg md:text-[1.65rem]"
              style={headingStyle}
            >
              A pulse is waiting. Click to connect.
            </p>

            <a
              href={PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-11 inline-flex min-h-[3.35rem] min-w-[15rem] items-center justify-center rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 px-8 py-3.5 text-lg font-semibold text-[#1c1408] shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_12px_40px_-8px_rgba(245,158,11,0.5),0_8px_24px_-8px_rgba(0,0,0,0.45)] transition-transform duration-200 hover:scale-[1.04] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_16px_48px_-8px_rgba(251,191,36,0.45)] active:scale-[0.98] md:min-w-[18rem] md:px-10"
              style={headingStyle}
            >
              Start Your Adventure
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
