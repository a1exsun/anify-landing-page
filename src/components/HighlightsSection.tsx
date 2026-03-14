import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { getGlassClass } from "@/utils/useGlassFallback";

gsap.registerPlugin(ScrollTrigger);

const HIGHLIGHTS = [
  {
    eyebrow: "Gaussian worlds",
    title: "Game-ready splat scenes—not just a backdrop.",
    description:
      "3D Gaussian splatting turned into something you can play in: spatial, lit, and meant to stay with the run.",
  },
  {
    eyebrow: "R3F + physics",
    title: "React Three Fiber and a real web physics stack.",
    description:
      "Familiar React ergonomics in 3D, with rigid bodies and interactions that feel grounded instead of decorative.",
  },
  {
    eyebrow: "UGC & tooling",
    title: "Scene configurator and creator pipelines.",
    description:
      "Layout, tune, and ship spaces without losing authorship—built for iteration and community-built corners.",
  },
  {
    eyebrow: "Structured narrative",
    title: "Campaign beats and mission-driven arcs.",
    description:
      "Objectives and story structure that pull the same direction—so exploration and plot reinforce each other.",
  },
  {
    eyebrow: "OpenClaw as a service",
    title: "Sandbox server architecture you can rely on.",
    description:
      "Agents and sessions backed by a service-shaped core: isolated sandboxes, clear boundaries, room to scale.",
  },
  {
    eyebrow: "Agent fabric",
    title: "User agent mapping, orchestration, and shared control.",
    description:
      "Some agents live with you; some we operate—mapped cleanly so ownership and routing stay understandable.",
  },
  {
    eyebrow: "Long-term memory",
    title: "We ship against two open memory systems.",
    description:
      "Integrated with OpenClaw-RL and memory-lancedb-pro so persistence stays explicit and auditable—not a black box.",
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
      className="relative flex min-h-screen w-full items-center justify-center px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20"
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
