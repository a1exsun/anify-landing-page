import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type * as THREE from "three";

import { CameraPath } from "./CameraPath";

gsap.registerPlugin(ScrollTrigger);

/** Same easing as scroll-driven camera (smoothstep) */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export type PinRangeGetter = () => { start: number; end: number } | null;

export class ScrollAnimator {
  private camera: THREE.PerspectiveCamera;
  private cameraPath: CameraPath;
  private reducedMotion: boolean;
  private renderFn: () => void;
  private scrollTrigger: ScrollTrigger | null = null;
  private directTween: gsap.core.Tween | null = null;
  private isDirectAnimating = false;
  private getPinRange: PinRangeGetter | null = null;

  constructor(camera: THREE.PerspectiveCamera, renderFn: () => void, cameraPath = new CameraPath()) {
    this.camera = camera;
    this.cameraPath = cameraPath;
    this.renderFn = renderFn;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.updateCamera(0);
    this.renderFn();
  }

  attach(scrollContainer: HTMLElement, options?: { getPinRange?: PinRangeGetter }): void {
    if (this.reducedMotion) {
      return;
    }

    this.getPinRange = options?.getPinRange ?? null;
    this.scrollTrigger?.kill();
    this.scrollTrigger = ScrollTrigger.create({
      trigger: scrollContainer,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.65,
      onUpdate: (self) => {
        if (this.isDirectAnimating) return;
        let progress = self.progress;
        const range = this.getScrollRange();
        const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
        if (range && this.getPinRange) {
          const pin = this.getPinRange();
          if (pin) {
            const pinnedProgress = (pin.start - range.start) / (range.end - range.start);
            const pinnedProgressClamped = Math.max(0, Math.min(1, pinnedProgress));
            const actualProgress = (scrollY - range.start) / (range.end - range.start);
            const actualClamped = Math.max(0, Math.min(1, actualProgress));
            const catchUpExitPx = typeof window !== "undefined" ? window.innerHeight * 0.35 : 120;
            const catchUpEnterPx = typeof window !== "undefined" ? window.innerHeight * 0.55 : 180;
            if (scrollY >= pin.start && scrollY <= pin.end) {
              progress = pinnedProgressClamped;
            } else if (scrollY > pin.end && scrollY < pin.end + catchUpExitPx) {
              const t = (scrollY - pin.end) / catchUpExitPx;
              const e = t * t * (3 - 2 * t);
              progress = pinnedProgressClamped + (actualClamped - pinnedProgressClamped) * e;
            } else if (scrollY < pin.start && scrollY > pin.start - catchUpEnterPx) {
              const t = (pin.start - scrollY) / catchUpEnterPx;
              const e = 1 - t;
              progress = actualClamped + (pinnedProgressClamped - actualClamped) * e;
            }
          }
        }
        this.updateCamera(progress);
        this.renderFn();
      },
    });
  }

  /** Scroll range in px for mapping scrollY to progress [0,1]. */
  getScrollRange(): { start: number; end: number } | null {
    const st = this.scrollTrigger;
    if (!st) return null;
    return { start: st.start, end: st.end };
  }

  /** Progress [0,1] from current scroll position. */
  getProgressFromScroll(scrollY: number): number {
    const range = this.getScrollRange();
    if (!range || range.end <= range.start) return 0;
    return Math.max(0, Math.min(1, (scrollY - range.start) / (range.end - range.start)));
  }

  /**
   * Animate camera directly from current progress to target progress (lerp/slerp between
   * the two keyframe poses), so 1→4 jumps without passing through 2 and 3.
   */
  animateDirectToProgress(
    currentProgress: number,
    targetProgress: number,
    duration: number,
    ease = "power2.inOut",
  ): void {
    this.directTween?.kill();
    const poseStart = this.cameraPath.getPoseAt(smoothstep(currentProgress));
    const poseEnd = this.cameraPath.getPoseAt(smoothstep(targetProgress));
    const posStart = poseStart.position.clone();
    const posEnd = poseEnd.position.clone();
    const qStart = poseStart.quaternion.clone();
    const qEnd = poseEnd.quaternion.clone();

    this.isDirectAnimating = true;
    const proxy = { t: 0 };
    this.directTween = gsap.to(proxy, {
      t: 1,
      duration,
      ease,
      onUpdate: () => {
        const t = smoothstep(proxy.t);
        this.camera.position.lerpVectors(posStart, posEnd, t);
        this.camera.quaternion.slerpQuaternions(qStart, qEnd, t);
        this.renderFn();
      },
      onKill: () => {
        this.isDirectAnimating = false;
      },
      onComplete: () => {
        this.isDirectAnimating = false;
        this.directTween = null;
      },
    });
  }

  dispose(): void {
    this.directTween?.kill();
    this.directTween = null;
    this.isDirectAnimating = false;
    this.scrollTrigger?.kill();
    this.scrollTrigger = null;
  }

  private updateCamera(scrollProgress: number): void {
    const t = smoothstep(scrollProgress);
    const { position, quaternion } = this.cameraPath.getPoseAt(t);
    this.camera.position.copy(position);
    this.camera.quaternion.copy(quaternion);
  }
}
