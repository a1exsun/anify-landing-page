import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { getGlassClass } from "@/utils/useGlassFallback";

gsap.registerPlugin(ScrollTrigger);

const HIGHLIGHTS = [
  {
    eyebrow: "Scene-first",
    title: "An explorable backdrop instead of another flat hero banner.",
    description:
      "Gaussian splatting keeps the page feeling spatial from the first section onward, even before the copy gets dense.",
  },
  {
    eyebrow: "Scroll cadence",
    title: "Camera motion is tied to the page rhythm, not an autoplay reel.",
    description:
      "The orbit advances only when the visitor moves, which keeps the motion intentional and preserves reading comfort.",
  },
  {
    eyebrow: "Graceful fallback",
    title: "If WebGL or the CDN fails, the narrative still lands cleanly.",
    description:
      "Every content block remains legible on a static gradient, with reduced blur on weaker devices and no compatibility cruft.",
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

    const context = gsap.context(() => {
      gsap.fromTo(
        card,
        { opacity: 0, x: -96 },
        {
          opacity: 1,
          x: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            end: "center center",
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
      className="relative flex min-h-screen items-center px-4 py-20 md:px-14"
    >
      <div
        ref={cardRef}
        className={`${glassClass} w-full max-w-xl overflow-hidden`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100/70">
          Highlights
        </p>
        <h2 className="mt-5 max-w-md text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl" style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.02em" }}>
          A landing page that sells atmosphere before it starts listing features.
        </h2>
        <div className="mt-10 space-y-7">
          {HIGHLIGHTS.map((item) => (
            <article
              key={item.title}
              className="border-l border-white/12 pl-5"
            >
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-cyan-100/60">
                {item.eyebrow}
              </p>
              <h3 className="mt-2 text-lg font-medium text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/68">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
