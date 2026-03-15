import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { getGlassClass } from "@/utils/useGlassFallback";

gsap.registerPlugin(ScrollTrigger);

const HIGHLIGHTS = [
  {
    eyebrow: "Gaussian worlds",
    title: "Game-ready 3D worlds built from Gaussian splats. ",
    description:
      "Spatial, lit, and interactive scenes that move beyond passive backdrops.",
  },
  {
    eyebrow: "R3F + physics",
    title: "React Three Fiber with a real-time web physics stack.",
    description:
      "Grounded movement and interactions make the world feel responsive and alive.",
  },
  {
    eyebrow: "UGC & tooling",
    title: "Creator pipelines for building, tuning, and shipping scenes.",
    description:
      "Designed for fast iteration while preserving authorship and world consistency.",
  },
  {
    eyebrow: "Structured narrative",
    title: "Mission-driven arcs with branching objectives and rising stakes.",
    description:
      "Exploration and story progression stay tightly connected throughout the run.",
  },
  {
    eyebrow: "Sandboxed Agent Runtime",
    title: "A reliable service layer for persistent agents and sessions.",
    description:
      "Isolated execution and clear boundaries make the system safer, more stable, and easier to scale.",
  },
  {
    eyebrow: "Agent Orchestration",
    title: "User agents, world agents, and shared control in one coordinated system.",
    description:
      "Clear routing and role design keep multi-agent interactions understandable and manageable.",
  },
  {
    eyebrow: "Long-term memory",
    title: "Persistent memory built on explicit, auditable storage layers.",
    description:
      "Characters and sessions can carry forward context, recall, and continuity over time.",
    links: [
      { label: "OpenClaw-RL", href: "https://github.com/Gen-Verse/OpenClaw-RL" },
      {
        label: "memory-lancedb-pro",
        href: "https://github.com/CortexReach/memory-lancedb-pro",
      },
    ],
  },
];

export function HighlightsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glassClass = `${getGlassClass()} glass-card`;

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;

    if (!section || !card) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(card, { clearProps: "all" });
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
        x = -88 * (1 - t);
        opacity = 0.15 + 0.85 * t;
        blurPx = 10 * (1 - t);
      } else if (p > outStart) {
        const t = ease((p - outStart) / (1 - outStart));
        x = -88 * t;
        opacity = 1 - 0.72 * t;
        blurPx = 8 * t;
      }
      gsap.set(card, {
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
      gsap.set(card, { clearProps: "opacity,transform,filter" });
    };
  }, []);

  return (
    <section
      id="highlights"
      ref={sectionRef}
      className="relative flex min-h-screen w-full items-start justify-center px-4 pb-20 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 sm:pt-4 md:px-10 md:pt-6 lg:px-14 lg:pt-8 xl:px-20"
    >
      <div
        ref={cardRef}
        className={`${glassClass} w-full max-w-none overflow-hidden will-change-transform`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100/70">
          Highlights
        </p>
        <h2
          className="mt-5 max-w-none text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl md:text-4xl"
          style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.02em" }}
        >
          Every word is a seed. Every scar is a story.
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 md:gap-x-10 md:gap-y-10 lg:gap-x-12">
          {HIGHLIGHTS.map((item, index) => (
            <article
              key={item.eyebrow}
              className={`min-w-0 border-l border-white/12 pl-5 md:pl-6 ${
                index === HIGHLIGHTS.length - 1 ? "md:col-span-2" : ""
              } ${
                item.eyebrow === "Sandboxed Agent Runtime" ? "md:self-center" : ""
              }`}
            >
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-cyan-100/60">
                {item.eyebrow}
              </p>
              <h3 className="mt-2 text-lg font-medium text-white md:text-xl">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-white/68 md:text-[0.9375rem] md:leading-8">
                {item.description}
              </p>
              {"links" in item && item.links ? (
                <p className="mt-2 text-sm text-cyan-200/80">
                  {item.links.map((link, i) => (
                    <span key={link.href}>
                      {i > 0 ? " · " : ""}
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-white/25 underline-offset-2 hover:text-cyan-100"
                      >
                        {link.label}
                      </a>
                    </span>
                  ))}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
