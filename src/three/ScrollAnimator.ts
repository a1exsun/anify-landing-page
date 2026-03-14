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
      scrub: 1.2,
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

  private updateCamera(t: number): void {
    const position = this.cameraPath.getPositionAt(t);
    const lookAt = this.cameraPath.getLookAtAt(t);
    this.camera.position.copy(position);
    this.camera.lookAt(lookAt);
  }
}
