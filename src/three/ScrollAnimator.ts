import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type * as THREE from "three";

import { CameraPath } from "./CameraPath";

gsap.registerPlugin(ScrollTrigger);

export class ScrollAnimator {
  private camera: THREE.PerspectiveCamera;
  private cameraPath: CameraPath;
  private reducedMotion: boolean;
  private renderFn: () => void;
  private scrollTrigger: ScrollTrigger | null = null;

  constructor(camera: THREE.PerspectiveCamera, renderFn: () => void, cameraPath = new CameraPath()) {
    this.camera = camera;
    this.cameraPath = cameraPath;
    this.renderFn = renderFn;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.updateCamera(0);
    this.renderFn();
  }

  attach(scrollContainer: HTMLElement): void {
    if (this.reducedMotion) {
      return;
    }

    this.scrollTrigger?.kill();
    this.scrollTrigger = ScrollTrigger.create({
      trigger: scrollContainer,
      start: "top top",
      end: "bottom bottom",
      /** 略加长滞后，长距离滚动时相机少「甩」 */
      scrub: 1.65,
      onUpdate: (self) => {
        this.updateCamera(self.progress);
        this.renderFn();
      },
    });
  }

  dispose(): void {
    this.scrollTrigger?.kill();
    this.scrollTrigger = null;
  }

  private updateCamera(scrollProgress: number): void {
    /**
     * smoothstep：在整页首尾（对应路径第 1 / 最后一帧）附近降低对 progress 的灵敏度，
     * 避免一切到顶/底就像相机「直接怼」到端点关键帧；中间段仍覆盖绝大部分路径。
     */
    const t = scrollProgress * scrollProgress * (3 - 2 * scrollProgress);
    const { position, quaternion } = this.cameraPath.getPoseAt(t);
    this.camera.position.copy(position);
    this.camera.quaternion.copy(quaternion);
  }
}
