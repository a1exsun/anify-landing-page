import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type * as THREE from "three";

import { CameraPath } from "./CameraPath";

gsap.registerPlugin(ScrollTrigger);

/** Same easing as scroll-driven camera (smoothstep) */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export class ScrollAnimator {
  private camera: THREE.PerspectiveCamera;
  private cameraPath: CameraPath;
  private renderFn: () => void;
  private scrollTrigger: ScrollTrigger | null = null;

  constructor(camera: THREE.PerspectiveCamera, renderFn: () => void, cameraPath = new CameraPath()) {
    this.camera = camera;
    this.cameraPath = cameraPath;
    this.renderFn = renderFn;

    this.updateCamera(0);
    this.renderFn();
  }

  attach(scrollContainer: HTMLElement): void {
    this.scrollTrigger?.kill();
    this.scrollTrigger = ScrollTrigger.create({
      trigger: scrollContainer,
      start: "top top",
      end: "bottom bottom",
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
    const t = smoothstep(scrollProgress);
    const { position, quaternion } = this.cameraPath.getPoseAt(t);
    this.camera.position.copy(position);
    this.camera.quaternion.copy(quaternion);
  }
}
