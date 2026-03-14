import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

/** 与 PlayCtaSection pin 的 end 距离一致，跳转 #play 时滚到该段末尾，避免 progress=0 时全透明像空背景 */
const PLAY_PIN_VH = 1.35;

/**
 * 与手滑滚动一致：用 tween 连续改变 scrollY，ScrollTrigger scrub / 区块动效会跟著走，
 * 避免锚点瞬跳导致 splat 相机角度错位、入场动效不出现。
 */
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
