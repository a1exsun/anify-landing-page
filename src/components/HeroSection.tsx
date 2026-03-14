import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5"
    >
      <div
        ref={contentRef}
        className="mx-auto flex max-w-5xl flex-col items-center text-center"
      >
        <p className="mb-5 rounded-full border border-white/15 bg-white/6 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.38em] text-cyan-100/80 backdrop-blur-md md:text-xs">
          Anify experimental landing
        </p>
        <h1
          className="max-w-5xl text-5xl font-semibold uppercase tracking-[0.14em] text-white md:text-7xl md:leading-[0.92]"
          style={{ textShadow: "0 16px 44px rgba(0, 0, 0, 0.52)" }}
        >
          Worldbuilding that feels like stepping through a lucid dream.
        </h1>
        <p
          className="mt-6 max-w-2xl text-sm leading-7 text-white/74 md:text-lg"
          style={{ textShadow: "0 8px 24px rgba(0, 0, 0, 0.4)" }}
        >
          Scroll through a cinematic orbit of the scene while the interface drifts above it like
          a sheet of liquid glass.
        </p>
      </div>
    </section>
  );
}
