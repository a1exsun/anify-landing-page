import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

/** Match PlayCtaSection pin end so #play lands past transparent phase */
const PLAY_PIN_VH = 1.35;

export function smoothNavScrollToHash(hash: string): void {
  const id = hash.replace(/^#/, "");
  const el = document.getElementById(id);
  if (!el) return;

  const sectionTopY = () => window.scrollY + el.getBoundingClientRect().top;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (id === "play") {
      window.scrollTo(0, sectionTopY() + window.innerHeight * PLAY_PIN_VH);
    } else {
      el.scrollIntoView({ block: "start" });
    }
    return;
  }

  let y: number;
  if (id === "play") {
    y = sectionTopY() + window.innerHeight * PLAY_PIN_VH;
  } else {
    y = el.getBoundingClientRect().top + window.scrollY;
  }

  gsap.killTweensOf(window);
  gsap.to(window, {
    duration: id === "play" ? 1.25 : 1.12,
    scrollTo: { y, autoKill: true },
    ease: "power2.inOut",
  });
}
