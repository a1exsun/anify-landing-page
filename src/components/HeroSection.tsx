import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { AnifyLogo } from "@/components/AnifyLogo";

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(content, { clearProps: "all" });
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        content,
        { opacity: 1, y: 0 },
        {
          opacity: 0,
          y: -96,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );
    }, section);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative box-border flex min-h-0 min-h-[100svh] items-center justify-center overflow-hidden px-5 py-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:py-6 md:py-8"
    >
      {/* Star field — single layer, very light */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5) 50%, transparent 50%),
            radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.35) 50%, transparent 50%),
            radial-gradient(1px 1px at 80% 20%, rgba(200,230,255,0.45) 50%, transparent 50%),
            radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.25) 50%, transparent 50%),
            radial-gradient(1px 1px at 90% 55%, rgba(255,255,255,0.2) 50%, transparent 50%)`,
          backgroundSize: "100% 100%",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      {/* Aurora veil — hero only, low opacity */}
      <div
        className="pointer-events-none absolute -top-1/4 left-1/2 h-[85%] w-[140%] -translate-x-1/2 opacity-50 blur-3xl md:opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(100, 190, 255, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 30% 40%, rgba(160, 120, 255, 0.08) 0%, transparent 45%)",
        }}
        aria-hidden
      />

      <div
        ref={contentRef}
        className="relative z-[1] mx-auto flex w-full max-w-3xl shrink-0 flex-col items-center px-2 py-2 text-center sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl"
      >
        <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <AnifyLogo />
        </div>

        <h1
          className="max-w-[22rem] text-2xl font-semibold leading-snug text-white sm:max-w-xl sm:text-3xl md:max-w-2xl md:text-4xl md:leading-tight lg:max-w-4xl lg:text-5xl lg:leading-tight xl:text-6xl xl:leading-[1.05] 2xl:text-[3.75rem]"
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            textShadow: "0 20px 48px rgba(0, 0, 0, 0.45)",
          }}
        >
          Worlds that breathe.
          <br />
          <span
            className="mt-1 inline-block bg-gradient-to-r from-cyan-100 via-white to-violet-200 bg-clip-text font-semibold text-transparent md:mt-0"
            style={{
              filter: "drop-shadow(0 0 28px rgba(140, 200, 255, 0.12))",
            }}
          >
            Moments that remember you.
          </span>
        </h1>

        <div
          className="font-whisper mt-6 max-w-xl space-y-2 text-base font-light italic leading-relaxed text-white/75 sm:mt-8 sm:text-lg md:mt-10 md:max-w-2xl md:text-xl md:leading-8 lg:mt-12 lg:text-xl lg:leading-relaxed xl:text-2xl"
          style={{
            fontFamily: "var(--font-whisper)",
            fontOpticalSizing: "auto",
            textShadow: "0 4px 20px rgba(0, 0, 0, 0.35)",
          }}
        >
          <p>Whisper to the wind — it&apos;s listening.</p>
          <p>Tread lightly. Your story is being etched into the soil.</p>
        </div>

        <div
          className="mt-4 flex items-center gap-3 sm:mt-5 md:mt-6"
          aria-hidden
        >
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/25" />
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.4em] text-white/30">
            Scroll
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-white/25" />
        </div>
      </div>
    </section>
  );
}
