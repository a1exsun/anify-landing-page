import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { getGlassClass } from "@/utils/useGlassFallback";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    code: "SYNC",
    name: "Scene-aware interface",
    description: "Each content block leaves space for the 3D world instead of covering it edge to edge.",
  },
  {
    code: "PATH",
    name: "Camera guided by page depth",
    description: "A CatmullRom path keeps the camera drift smooth and deliberate across four full-screen sections.",
  },
  {
    code: "LOAD",
    name: "Progressive splat loading",
    description: "Preview and final-quality meshes swap through a radial reveal rather than a hard visual cut.",
  },
  {
    code: "MOBILE",
    name: "Performance-aware fallback",
    description: "Old iOS devices degrade blur and render density so the page stays stable instead of collapsing.",
  },
];

export function FeaturesSection() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const glassClass = getGlassClass();

  useEffect(() => {
    const cards = cardsRef.current;
    const section = sectionRef.current;
    if (!cards || !section) {
      return;
    }

    const cardElements = cards.querySelectorAll<HTMLElement>("[data-feature-card]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(cardElements, { clearProps: "all", opacity: 1, x: 0, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardElements,
        { opacity: 0, x: 88, y: 20 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          ease: "none",
          stagger: 0.12,
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            end: "center 50%",
            scrub: 0.8,
          },
        },
      );
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-end px-5 py-16 md:px-12 lg:px-18"
    >
      <div ref={cardsRef} className="w-full max-w-xl space-y-4">
        <div className="mb-8 text-left md:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/52">Features</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-white md:text-4xl">
            Built to sell the atmosphere, not just list capabilities.
          </h2>
        </div>
        {FEATURES.map((feature) => (
          <article
            key={feature.code}
            data-feature-card
            className={`${glassClass} glass-card flex items-start gap-4 opacity-0`}
          >
            <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-black/18 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#d7e7ff]">
              {feature.code}
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-medium text-white">{feature.name}</h3>
              <p className="mt-2 max-w-sm text-sm leading-7 text-white/70 md:text-[0.95rem]">{feature.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
