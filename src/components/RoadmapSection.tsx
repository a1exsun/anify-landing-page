import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { getGlassClass } from "@/utils/useGlassFallback";

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  {
    id: "world",
    label: "World",
    tagline: "Space, lore, long arcs",
    accent: "from-cyan-400/50 to-teal-400/20",
    items: [
      { title: "More scenes", line: "Wider Gaussian spaces—ruins, coasts, underground." },
      { title: "World-building", line: "Mythology, factions, threads across regions." },
      { title: "Campaigns", line: "Multi-arc stories that reward staying in." },
    ],
  },
  {
    id: "character",
    label: "Character",
    tagline: "Cast, motion, wear",
    accent: "from-violet-400/45 to-fuchsia-400/15",
    items: [
      { title: "More characters", line: "Companions and rivals with memory and voice." },
      { title: "Live2D", line: "Portraits that react in context." },
      { title: "Battle art", line: "Damage and wear on the face of the fight." },
    ],
  },
  {
    id: "systems",
    label: "Systems",
    tagline: "Loops you live in",
    accent: "from-amber-300/40 to-orange-400/15",
    items: [
      { title: "Economy", line: "Shops, forging, guilds, co-op quests." },
      { title: "D20 in combat", line: "Rolls that matter in the fray." },
      { title: "Self-host", line: "Your deploy, your OpenClaw." },
    ],
  },
];

export function RoadmapSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const glassClass = getGlassClass();

  useEffect(() => {
    const section = sectionRef.current;
    const timeline = timelineRef.current;
    if (!section || !timeline) {
      return;
    }

    const pillars = timeline.querySelectorAll<HTMLElement>("[data-roadmap-pillar]");
    gsap.set(pillars, { clearProps: "transform,opacity,filter" });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(timeline, { clearProps: "all", opacity: 1, filter: "none" });
      return;
    }

    const ctx = gsap.context(() => {
      /* 只动外层一次，不对三张卡 stagger，避免 scrub 下各卡不同步像台阶 */
      gsap.fromTo(
        timeline,
        { opacity: 0.5, filter: "blur(6px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            end: "top 58%",
            scrub: 0.5,
          },
        },
      );
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full min-w-0 min-h-[100dvh] items-start justify-center px-4 pb-16 pt-[max(2rem,env(safe-area-inset-top))] sm:px-5 md:min-h-screen md:items-start md:px-10 md:pb-24 md:pt-[min(12vh,7rem)] lg:px-14"
    >
      <div
        ref={timelineRef}
        className="w-full min-w-0 max-w-5xl shrink-0"
      >
        <header className="mx-auto mb-8 max-w-xl px-2 py-2 text-center md:mb-12">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.38em] text-cyan-100 [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
            Roadmap
          </p>
          <h2
            className="roadmap-hero-title mx-auto mt-3 max-w-lg text-2xl font-semibold leading-tight tracking-tight md:text-3xl lg:text-[2.125rem]"
            style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.03em" }}
          >
            What comes next.
          </h2>
        </header>

        {/*
          Mobile: flex-col. Desktop: 3 equal columns, top-aligned (no stagger).
        */}
        <div data-roadmap-pillars className="w-full min-w-0">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.id}
              data-roadmap-pillar
              className={`${glassClass} relative box-border w-full min-w-0 overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.06] p-5 shadow-[0_20px_64px_-36px_rgba(0,0,0,0.45)] md:min-w-0 md:p-6 lg:p-7`}
            >
              <div
                className={`roadmap-pillar-accent absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${pillar.accent}`}
                aria-hidden
              />
              <div className="flex min-h-0 min-w-0 flex-1 flex-col pl-4">
                <div className="mb-4 shrink-0 border-b border-white/[0.08] pb-4">
                  <p
                    className={`text-[0.7rem] font-bold uppercase tracking-[0.28em] [text-shadow:0_1px_6px_rgba(0,0,0,0.3)] ${
                      pillar.id === "world"
                        ? "text-cyan-100"
                        : pillar.id === "character"
                          ? "text-violet-100"
                          : "text-amber-50"
                    }`}
                  >
                    {pillar.label}
                  </p>
                  <p className="mt-1.5 text-[0.8125rem] font-medium leading-snug text-white/88 [text-shadow:0_1px_6px_rgba(0,0,0,0.25)]">
                    {pillar.tagline}
                  </p>
                </div>
                <ul className="min-h-0 flex-1 space-y-4">
                  {pillar.items.map((item) => (
                    <li key={item.title} className="min-w-0">
                      <p className="text-sm font-semibold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.28)]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[0.8125rem] leading-relaxed text-white/80 [text-shadow:0_1px_4px_rgba(0,0,0,0.2)]">
                        {item.line}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
