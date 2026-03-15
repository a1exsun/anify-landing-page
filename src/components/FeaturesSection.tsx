import { useContext, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { PinRangeContext } from "@/App";
import {
  getFeaturesFirstFeatScrollY,
  setFeaturesFirstFeatScrollY,
} from "@/lib/smoothNavScroll";
import { getGlassClass } from "@/utils/useGlassFallback";

gsap.registerPlugin(ScrollTrigger);

import aiImg from "@/assets/ai.png";
import advImg from "@/assets/adv.png";
import cmbImg from "@/assets/cmb.png";
import townImg from "@/assets/town.png";

const FEATURE_IMAGES: Record<string, string> = {
  ai: aiImg,
  adv: advImg,
  cmb: cmbImg,
  town: townImg,
};

const FEATURES = [
  {
    id: "ai",
    name: "AI companion",
    description:
      "Persistent NPC agents carry memory and relationship state across sessions.",
    image: "ai",
  },
  {
    id: "adv",
    name: "Adventure",
    description:
      "Branching objectives and rising stakes drive each run forward.",
    image: "adv",
  },
  {
    id: "cmb",
    name: "Combat",
    description:
      "Combat grows out of the world state, not a separate mode.",
    image: "cmb",
  },
  {
    id: "town",
    name: "Town exploration",
    description:
      "Towns work as persistent hubs with shops, guilds, and changing routines.",
    image: "town",
  },
];

const ENTRANCE_END = 0.18;
const CAROUSEL_START = 0.2;
const CARD_COUNT = FEATURES.length;
const HOLD_RATIO = 0.82;

function easeSmooth(t: number): number {
  return t * t * (3 - 2 * t);
}

const PIN_DURATION = "280%";
const FADE_AFTER_PIN_VH = 0.28;
/** Pin progress at which first card (AI companion) is fully visible in carousel. */
const FIRST_FEAT_PROGRESS = 0.28;

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const contentWrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const glassClass = getGlassClass();
  const pinRangeContext = useContext(PinRangeContext);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

    if (!section || !track || cards.length !== CARD_COUNT) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([track, cards], { clearProps: "all" });
      cards.forEach((c) => gsap.set(c, { opacity: 1, scale: 1, filter: "none" }));
      if (contentWrapRef.current) gsap.set(contentWrapRef.current, { clearProps: "opacity,transform" });
      return;
    }

    const apply = (progress: number) => {
      if (progress < ENTRANCE_END) {
        const t = progress / ENTRANCE_END;
        const baseX = 100;
        cards.forEach((card, i) => {
          const staggerStart = (i / CARD_COUNT) * 0.5;
          const s = Math.max(0, Math.min(1, (t - staggerStart) / (1 - staggerStart)));
          const x = baseX * (1 - easeSmooth(s));
          const opacity = 0.25 + 0.75 * easeSmooth(s);
          gsap.set(card, {
            x,
            opacity,
            scale: 1,
            filter: "none",
          });
        });
        gsap.set(track, { x: 0 });
        return;
      }

      const carouselT = Math.max(0, (progress - CAROUSEL_START) / (1 - CAROUSEL_START));
      const segment = 1 / CARD_COUNT;
      const segIndex = Math.min(CARD_COUNT - 1, Math.floor(carouselT / segment));
      const tInSeg = segment > 0 ? (carouselT - segIndex * segment) / segment : 0;
      const transitionStart = HOLD_RATIO;
      const frac =
        tInSeg < transitionStart
          ? 0
          : Math.min(1, (tInSeg - transitionStart) / (1 - transitionStart));
      const currentIndex = segIndex;

      cards.forEach((card, i) => {
        const dist = i - currentIndex;
        let scale: number;
        let blurPx: number;
        let opacity: number;
        if (dist === 0) {
          scale = 1;
          blurPx = 0;
          opacity = 1;
        } else if (dist === -1) {
          const u = 1 - frac;
          scale = 0.8 + 0.2 * u;
          blurPx = 2 + 5 * (1 - u);
          opacity = 0.6 + 0.4 * u;
        } else if (dist === 1) {
          const u = frac;
          scale = 0.8 + 0.2 * (1 - u);
          blurPx = 2 + 5 * u;
          opacity = 0.6 + 0.4 * (1 - u);
        } else {
          scale = 0.72;
          blurPx = 8;
          opacity = 0.45;
        }
        gsap.set(card, {
          x: 0,
          opacity,
          scale,
          filter: blurPx > 0.4 ? `blur(${blurPx}px)` : "none",
        });
      });

      const slotPct = 100 / CARD_COUNT;
      gsap.set(track, { x: `${-(currentIndex + frac) * slotPct}%` });
    };

    gsap.set(cards, { x: 120, opacity: 0.2 });
    gsap.set(track, { x: 0 });

    const setPinRange = pinRangeContext?.setPinRange;
    const clearPinRange = pinRangeContext?.clearPinRange;

    const pinSt = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${PIN_DURATION}`,
      pin: true,
      scrub: 0.9,
      onUpdate: (self) => {
        if (setPinRange) setPinRange(self.start, self.end);
        setFeaturesFirstFeatScrollY(
          self.start + FIRST_FEAT_PROGRESS * (self.end - self.start),
        );
        apply(self.progress);
      },
    });
    if (setPinRange) setPinRange(pinSt.start, pinSt.end);
    setFeaturesFirstFeatScrollY(
      pinSt.start + FIRST_FEAT_PROGRESS * (pinSt.end - pinSt.start),
    );

    const fadeAfterPx = typeof window !== "undefined" ? window.innerHeight * FADE_AFTER_PIN_VH : 200;
    const fadeSt = ScrollTrigger.create({
      trigger: document.body,
      start: () => pinSt.end,
      end: () => pinSt.end + fadeAfterPx,
      scrub: 0.4,
      onUpdate: (self) => {
        const contentWrap = contentWrapRef.current;
        if (contentWrap) {
          const e = self.progress * self.progress;
          gsap.set(contentWrap, { opacity: 1 - e, y: -24 * e });
        }
      },
    });

    let snappedFromEnd = false;
    const snapZoneSt = ScrollTrigger.create({
      trigger: document.body,
      start: () => pinSt.end - 80,
      end: () => pinSt.end + fadeAfterPx + 80,
      onUpdate: (self) => {
        const sy = window.scrollY;
        const end = pinSt.end;
        const fadeEnd = end + fadeAfterPx;
        if (self.direction === -1 && sy >= end && sy <= fadeEnd) {
          if (!snappedFromEnd) {
            snappedFromEnd = true;
            const firstFeatY = getFeaturesFirstFeatScrollY();
            if (firstFeatY != null) {
              gsap.killTweensOf(window);
              gsap.to(window, {
                duration: 0.6,
                scrollTo: { y: firstFeatY, autoKill: true },
                ease: "power2.out",
              });
            }
          }
        }
        if (sy < pinSt.start - 50) snappedFromEnd = false;
        if (sy > fadeEnd + 80) snappedFromEnd = false;
      },
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      if (clearPinRange) clearPinRange();
      setFeaturesFirstFeatScrollY(null);
      snapZoneSt.kill();
      fadeSt.kill();
      pinSt.kill();
      gsap.set([track, cards], { clearProps: "opacity,transform,filter" });
      if (contentWrapRef.current) gsap.set(contentWrapRef.current, { clearProps: "opacity,transform" });
    };
  }, [pinRangeContext]);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative flex min-h-[100vh] w-full flex-col overflow-hidden px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(calc(3.25rem+2.5rem+env(safe-area-inset-top)),env(safe-area-inset-top))] sm:px-6 sm:pt-[max(calc(3.25rem+2rem+env(safe-area-inset-top)),env(safe-area-inset-top))] md:px-8 md:pt-[max(calc(3.25rem+1.5rem+env(safe-area-inset-top)),env(safe-area-inset-top))] lg:px-10 lg:pt-[max(calc(3.25rem+1.5rem+env(safe-area-inset-top)),env(safe-area-inset-top))]"
    >
      <header className="relative z-10 shrink-0 pb-3 text-center sm:pb-2.5 md:pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100/70 sm:text-[0.8rem]">
          Features
        </p>
        <h2
          className="mx-auto mt-2.5 max-w-4xl text-xl font-semibold leading-tight tracking-tight text-white sm:mt-2 sm:text-2xl md:whitespace-nowrap md:text-[1.75rem] lg:text-3xl xl:text-4xl"
          style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.02em" }}
        >
          Forge bonds in the tavern, legends in the fray.
        </h2>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div className="h-full w-full max-w-5xl overflow-hidden py-0.5 md:max-w-6xl md:py-1">
          <div ref={contentWrapRef} className="h-full w-full will-change-transform">
          <div
            ref={trackRef}
            className="flex h-full max-h-[min(82vh,38rem)] will-change-transform sm:max-h-[min(84vh,40rem)] md:max-h-[min(86vh,44rem)]"
            style={{ width: `${CARD_COUNT * 100}%` }}
          >
            {FEATURES.map((feature, index) => (
              <div
                key={feature.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                {...(index === 0 ? { "data-first-feat": "" } : {})}
                className="flex h-full shrink-0 flex-col overflow-hidden rounded-2xl border border-white/12 px-1 will-change-transform sm:px-1.5 md:px-2"
                style={{ width: `${100 / CARD_COUNT}%` }}
              >
                <div
                  className={`${glassClass} flex h-full min-h-0 flex-col overflow-hidden border-0`}
                >
                  <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-cyan-500/10 via-white/5 to-amber-500/10">
                    {FEATURE_IMAGES[feature.image] ? (
                      <img
                        src={FEATURE_IMAGES[feature.image]}
                        alt=""
                        className="h-full w-full object-contain object-center"
                        aria-hidden
                      />
                    ) : (
                      <div
                        className="absolute left-0 right-0 top-1/2 w-full -translate-y-1/2 aspect-[4/3] bg-gradient-to-br from-cyan-500/20 via-white/10 to-amber-500/15"
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className="flex min-h-[4rem] shrink-0 flex-col justify-center overflow-hidden px-4 py-2 sm:min-h-[4.25rem] sm:py-2.5 md:min-h-[4.5rem] md:px-5 md:py-3">
                    <h3 className="truncate text-base font-medium text-white sm:text-lg md:text-xl">
                      {feature.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-snug text-white/70 sm:mt-1.5 sm:text-[0.9375rem] md:leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
