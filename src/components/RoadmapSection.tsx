import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { getGlassClass } from "@/utils/useGlassFallback";

gsap.registerPlugin(ScrollTrigger);

const MILESTONES = [
  {
    date: "Phase 01",
    title: "Cinematic landing",
    blurb: "Ship the scroll-driven splat orbit with a stable fallback for weaker devices and browsers.",
  },
  {
    date: "Phase 02",
    title: "World hooks",
    blurb: "Thread stronger story teasers and character cues through the sections without flattening the layout.",
  },
  {
    date: "Phase 03",
    title: "Product bridge",
    blurb: "Connect the page to a lighter-weight entry flow so the motion language leads into the actual experience.",
  },
  {
    date: "Phase 04",
    title: "Launch tuning",
    blurb: "Tune camera points, copy cadence, and scene choice around a release-quality narrative arc.",
  },
];

export function RoadmapSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const glassClass = `${getGlassClass()} glass-timeline`;

  useEffect(() => {
    const section = sectionRef.current;
    const timeline = timelineRef.current;
    if (!section || !timeline) {
      return;
    }

    const nodes = timeline.querySelectorAll<HTMLElement>("[data-milestone]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([timeline, ...nodes], { clearProps: "all", opacity: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        timeline,
        { opacity: 0, y: 72 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            end: "center center",
            scrub: 0.8,
          },
        },
      );

      gsap.fromTo(
        nodes,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          ease: "none",
          stagger: 0.12,
          scrollTrigger: {
            trigger: section,
            start: "top 58%",
            end: "bottom center",
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
      className="relative flex min-h-screen items-end justify-center px-5 pb-10 pt-20 md:items-center md:px-12 md:pb-0 lg:px-18"
    >
      <div
        ref={timelineRef}
        className="w-full max-w-6xl"
      >
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.32em] text-white/54">
          Roadmap
        </p>
        <h2 className="mx-auto mb-8 max-w-3xl text-center text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl" style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.02em" }}>
          The landing surface is just the first shell. The motion system can grow with the product.
        </h2>

        <div className={`hidden md:block ${glassClass}`}>
          <div className="grid grid-cols-4 gap-6">
            {MILESTONES.map((milestone, index) => (
              <article
                key={milestone.title}
                data-milestone
                className="relative min-h-44"
              >
                {index < MILESTONES.length - 1 ? (
                  <div className="absolute left-[calc(50%+1.25rem)] top-[1.1rem] h-px w-[calc(100%-2.5rem)] bg-white/16" />
                ) : null}
                <div className="h-3 w-3 rounded-full bg-[#bff9ff] shadow-[0_0_18px_rgba(173,244,255,0.45)]" />
                <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#d7e7ff]/62">
                  {milestone.date}
                </p>
                <h3 className="mt-3 text-lg font-medium text-white">{milestone.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/70">{milestone.blurb}</p>
              </article>
            ))}
          </div>
        </div>

        <div className={`md:hidden ${glassClass}`}>
          <div className="relative space-y-8">
            <div className="absolute left-[0.35rem] top-2 bottom-2 w-px bg-white/16" />
            {MILESTONES.map((milestone) => (
              <article
                key={milestone.title}
                data-milestone
                className="relative pl-8"
              >
                <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-[#bff9ff] shadow-[0_0_18px_rgba(173,244,255,0.45)]" />
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#d7e7ff]/62">
                  {milestone.date}
                </p>
                <h3 className="mt-2 text-base font-medium text-white">{milestone.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/70">{milestone.blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
