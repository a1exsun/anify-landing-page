import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

/**
 * 与手滑滚动一致：用 tween 连续改变 scrollY，ScrollTrigger scrub / 区块动效会跟著走，
 * 避免锚点瞬跳导致 splat 相机角度错位、入场动效不出现。
 */
export function smoothNavScrollToHash(hash: string): void {
  const id = hash.replace(/^#/, "");
  const el = document.getElementById(id);
  if (!el) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.scrollIntoView({ block: "start" });
    return;
  }

  const y = el.getBoundingClientRect().top + window.scrollY;
  gsap.killTweensOf(window);
  gsap.to(window, {
    duration: 1.12,
    scrollTo: { y, autoKill: true },
    ease: "power2.inOut",
  });
}
