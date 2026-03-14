import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

export function PlayCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    if (!section || !inner) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(inner, { clearProps: "all" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { opacity: 0, y: 28, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            end: "center 55%",
            scrub: 0.65,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="play"
      ref={sectionRef}
      className="relative flex min-h-[100dvh] w-full min-w-0 items-center justify-center px-5 py-[max(3rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] md:px-10 md:py-24"
    >
      <div
        ref={innerRef}
        className="relative flex w-full max-w-lg flex-col items-center text-center md:max-w-xl"
      >
        <div className="play-cta-icon-float text-amber-400">
          <LandingSparkles className="mx-auto h-12 w-12 md:h-14 md:w-14" />
        </div>

        <p
          className="mt-8 max-w-md text-2xl font-bold leading-snug tracking-tight text-white md:max-w-lg md:text-[1.65rem]"
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
    </section>
  );
}
