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

/** Resolve hash to target scroll Y and duration (for direct nav or fallback). */
export function getTargetScroll(hash: string): TargetScroll | null {
  const id = hash.replace(/^#/, "");
  const el = document.getElementById(id);
  if (!el) return null;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const y = id === "play" ? top + window.innerHeight * PLAY_PIN_VH : top;
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
