import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { getGlassClass } from "@/utils/useGlassFallback";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    id: "ai",
    name: "AI companion",
    description:
      "Agents stay with you across sessions—memory and dialogue tied to who you are here. Companions and rivals can call back what actually happened, not a reset chat box.",
  },
  {
    id: "adv",
    name: "Adventure",
    description:
      "Campaign-style beats: branching objectives and rising stakes so every run has somewhere to go. Exploration and story pull in the same direction.",
  },
  {
    id: "cmb",
    name: "Combat",
    description:
      "Fights happen where you already are—same space, same context. When talk ends, tension has a cost; outcomes feed the next leg of the road.",
  },
  {
    id: "town",
    name: "Town exploration",
    description:
      "Hubs you revisit—shops, boards, guilds, NPC rhythms that shift as you progress. A base that grows with you, not a one-off backdrop.",
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

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(cards, { clearProps: "all", opacity: 1, x: 0 });
      return;
    }

    const ease = (t: number) => t * t * (3 - 2 * t);

    const apply = (raw: number) => {
      const p = Math.min(1, Math.max(0, raw));
      const inEnd = 0.28;
      const outStart = 0.66;
      let x = 0;
      let opacity = 1;
      let blurPx = 0;
      if (p < inEnd) {
        const t = ease(p / inEnd);
        x = 88 * (1 - t);
        opacity = 0.15 + 0.85 * t;
        blurPx = 10 * (1 - t);
      } else if (p > outStart) {
        const t = ease((p - outStart) / (1 - outStart));
        x = 88 * t;
        opacity = 1 - 0.72 * t;
        blurPx = 8 * t;
      }
      gsap.set(cards, {
        x,
        opacity,
        filter: blurPx > 0.4 ? `blur(${blurPx}px)` : "none",
      });
    };

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: 0.72,
      onUpdate: (self) => apply(self.progress),
    });

    apply(st.progress);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      st.kill();
      gsap.set(cards, { clearProps: "opacity,transform,filter" });
    };
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative box-border flex h-[100svh] max-h-[100svh] min-h-[100svh] items-stretch justify-end overflow-hidden px-4 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8 md:px-12 lg:px-16"
    >
      <div
        ref={cardsRef}
        className="ml-auto flex h-full w-full max-w-xl flex-col will-change-transform lg:max-w-2xl"
      >
        <header className="shrink-0 pt-2 text-right md:pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100/70 sm:text-[0.8rem]">
            Features
          </p>
          <h2
            className="mt-3 max-w-xl text-2xl font-semibold leading-[1.15] tracking-tight text-white sm:mt-4 sm:text-3xl md:ml-auto md:text-[1.75rem] md:leading-[1.12] lg:text-4xl lg:leading-[1.1]"
            style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.02em" }}
          >
            Forge bonds in the tavern, legends in the fray.
          </h2>
        </header>

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-2 sm:mt-5 sm:gap-2.5 md:gap-3 lg:mt-6 lg:gap-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.id}
              data-feature-card
              className={`${glassClass} flex min-h-0 flex-1 basis-0 items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 md:px-6`}
            >
              <div
                className="h-11 w-11 shrink-0 rounded-xl border border-white/14 bg-white/[0.07] sm:h-12 sm:w-12 md:h-14 md:w-14"
                aria-hidden
              />
              <div className="min-w-0 flex-1 py-0.5">
                <h3 className="text-lg font-medium text-white sm:text-xl">
                  {feature.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/70 sm:mt-2 sm:text-[0.95rem] md:text-base md:leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
