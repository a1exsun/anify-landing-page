import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

/** Match PlayCtaSection pin end so #play lands past transparent phase */
export const PLAY_PIN_VH = 1.35;

export interface TargetScroll {
  id: string;
  y: number;
  duration: number;
}

const FEATURES_FIRST_CARD_TOP_PX = 24;

let _featuresFirstFeatScrollY: number | null = null;

/** Register scroll Y for "first feat (AI companion) fully visible" from FeaturesSection pin progress. */
export function setFeaturesFirstFeatScrollY(y: number | null): void {
  _featuresFirstFeatScrollY = y;
}

/** Target scroll Y so first feat card (AI companion) is fully in view (for nav and snap-from-below). */
export function getFeaturesFirstFeatScrollY(): number | null {
  if (_featuresFirstFeatScrollY != null) return _featuresFirstFeatScrollY;
  const el = document.getElementById("features");
  if (!el) return null;
  const firstFeat = el.querySelector<HTMLElement>("[data-first-feat]");
  if (firstFeat) {
    return firstFeat.getBoundingClientRect().top + window.scrollY - FEATURES_FIRST_CARD_TOP_PX;
  }
  return el.getBoundingClientRect().top + window.scrollY;
}

/** Resolve hash to target scroll Y and duration (for direct nav or fallback). */
export function getTargetScroll(hash: string): TargetScroll | null {
  const id = hash.replace(/^#/, "");
  const el = document.getElementById(id);
  if (!el) return null;
  const top = el.getBoundingClientRect().top + window.scrollY;
  let y: number;
  if (id === "play") {
    y = top + window.innerHeight * PLAY_PIN_VH;
  } else if (id === "features") {
    const firstFeatY = getFeaturesFirstFeatScrollY();
    y = firstFeatY ?? top;
  } else {
    y = top;
  }
  const duration = id === "play" ? 1.25 : 1.12;
  return { id, y, duration };
}

export function smoothNavScrollToHash(hash: string): void {
  const target = getTargetScroll(hash);
  if (!target) return;
  const el = document.getElementById(target.id);
  if (!el) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (target.id === "play") {
      window.scrollTo(0, target.y);
    } else {
      el.scrollIntoView({ block: "start" });
    }
    return;
  }

  gsap.killTweensOf(window);
  gsap.to(window, {
    duration: target.duration,
    scrollTo: { y: target.y, autoKill: true },
    ease: "power2.inOut",
  });
}
