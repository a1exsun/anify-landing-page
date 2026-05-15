import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

export const PLAY_PIN_VH = 1.35;

export interface TargetScroll {
  id: string;
  y: number;
  duration: number;
}

const SNAP_TARGET_IDS = [
  "hero",
  "features",
  "feature-ai",
  "feature-adv",
  "feature-cmb",
  "feature-town",
  "highlights",
  "roadmap",
  "play",
] as const;
const ANCHOR_TOP_OFFSET_PX = 64;

function clampScrollY(y: number): number {
  const maxY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  return Math.max(0, Math.min(maxY, y));
}

function getElementTop(id: string): number | null {
  const el = document.getElementById(id);
  if (!el) return null;
  return el.getBoundingClientRect().top + window.scrollY;
}

export function getTargetScroll(hash: string): TargetScroll | null {
  const id = hash.replace(/^#/, "");
  const top = getElementTop(id);
  if (top == null) return null;
  const y =
    id === "hero"
      ? top
      : id === "play"
        ? top + window.innerHeight * PLAY_PIN_VH
        : top - ANCHOR_TOP_OFFSET_PX;

  return {
    id,
    y,
    duration: id === "play" ? 1.18 : 0.95,
  };
}

function normalizeTargets(targets: TargetScroll[]): TargetScroll[] {
  const sorted = targets
    .map((target) => ({ ...target, y: clampScrollY(target.y) }))
    .sort((a, b) => a.y - b.y);
  const result: TargetScroll[] = [];
  sorted.forEach((target) => {
    const previous = result[result.length - 1];
    if (previous && Math.abs(previous.y - target.y) < 24) {
      return;
    }
    result.push(target);
  });
  return result;
}

export function getNarrativeSnapTargets(): TargetScroll[] {
  return normalizeTargets(
    SNAP_TARGET_IDS.flatMap((id) => {
      const target = getTargetScroll(`#${id}`);
      return target ? [target] : [];
    }),
  );
}

export function smoothNavScrollToHash(hash: string): void {
  const target = getTargetScroll(hash);
  if (!target) return;

  gsap.killTweensOf(window);
  gsap.to(window, {
    duration: target.duration,
    scrollTo: { y: target.y, autoKill: false },
    ease: "power2.inOut",
  });
}
