import { SplatMesh, dyno } from "@sparkjsdev/spark";
import * as THREE from "three";

import { isMobileDevice, isOldIOS } from "@/utils/deviceDetect";

import { createPreviewPointModifier } from "./previewPointModifier";
import { createRadialTransitionModifier } from "./radialTransitionModifier";

const FALLBACK_GRADIENT = "linear-gradient(135deg, #0a0a1a, #1a1a2e)";
const RING_COLOR: [number, number, number] = [1.0, 0.92, 0.7];
const PROGRESSIVE_REVEAL = {
  durationMs: 3000,
  fallbackMaxRadius: 400,
  ringStrength: 0.66,
};

interface ProgressiveUrls {
  preview: string;
  full: string;
}

type SceneMesh = THREE.Object3D & {
  dispose?: () => void;
  getBoundingBox?: (worldSpace?: boolean) => THREE.Box3 | undefined;
  initialized: Promise<unknown>;
  needsUpdate?: boolean;
  quaternion: THREE.Quaternion;
  updateGenerator?: () => void;
  worldModifier?: unknown;
};

function getProgressiveUrls(splatUrl: string): ProgressiveUrls {
  if (splatUrl.endsWith("_500k.spz")) {
    const base = splatUrl.slice(0, -"_500k.spz".length);
    return { preview: `${base}_100k.spz`, full: splatUrl };
  }

  return { preview: splatUrl, full: splatUrl };
}

function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export class SplatScene {
  private camera: THREE.PerspectiveCamera | null = null;
  private container: HTMLDivElement | null = null;
  private contextLossCount = 0;
  private disposed = false;
  private downsample = isOldIOS() ? 4 : 2;
  private errorCallbacks: Array<(error: Error) => void> = [];
  private fullMesh: SceneMesh | null = null;
  private loadCallbacks: Array<() => void> = [];
  private previewMesh: SceneMesh | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private revealFrameId: number | null = null;
  private scene: THREE.Scene | null = null;
  private splatUrl = "";
  private tabHidden = false;

  onLoad(callback: () => void): void {
    this.loadCallbacks.push(callback);
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback);
  }

  getCamera(): THREE.PerspectiveCamera | null {
    return this.camera;
  }

  isReady(): boolean {
    return this.previewMesh !== null || this.fullMesh !== null;
  }

  init(container: HTMLDivElement, splatUrl: string): void {
    this.container = container;
    this.splatUrl = splatUrl;
    this.disposed = false;
    this.initWebGL();
  }

  render(): void {
    if (this.disposed || this.tabHidden || !this.renderer || !this.scene || !this.camera) {
      return;
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.disposed = true;
    this.teardown();
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.container = null;
  }

  private initWebGL(): void {
    const container = this.container;
    if (!container) {
      return;
    }

    const oldIOS = isOldIOS();
    const pixelRatio = oldIOS ? 1 : Math.min(window.devicePixelRatio, 1.5);
    const isMobile = isMobileDevice();

    container.style.background = "";

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(isMobile ? 80 : 70, 1, 0.1, 1000);
    this.camera.position.set(0, 0.5, 3);
    this.camera.lookAt(0, 0, 0);

    try {
      this.renderer = new THREE.WebGLRenderer({
        alpha: false,
        antialias: false,
        depth: true,
        powerPreference: "high-performance",
        precision: oldIOS ? "lowp" : "mediump",
        stencil: false,
      });
    } catch {
      this.fireError(new Error("WebGL not supported"));
      this.showFallback();
      return;
    }

    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.domElement.addEventListener("webglcontextlost", this.onContextLost);
    this.renderer.domElement.addEventListener("webglcontextrestored", this.onContextRestored);

    container.innerHTML = "";
    container.appendChild(this.renderer.domElement);

    window.addEventListener("resize", this.onResize);
    document.addEventListener("visibilitychange", this.onVisibilityChange);

    this.onResize();
    this.loadSplat();
  }

  private loadSplat(): void {
    if (!this.scene) {
      return;
    }

    const urls = getProgressiveUrls(this.splatUrl);
    const previewMesh = new SplatMesh({
      downsample: this.downsample,
      objectModifier: createPreviewPointModifier(),
      url: urls.preview,
      worker: true,
    } as never) as SceneMesh;

    previewMesh.quaternion.set(1, 0, 0, 0);
    this.previewMesh = previewMesh;
    this.scene.add(previewMesh);

    void previewMesh.initialized
      .then(() => {
        if (this.disposed) {
          return;
        }

        this.render();

        if (urls.preview === urls.full) {
          this.fullMesh = previewMesh;
          this.previewMesh = null;
          this.fireLoad();
          return;
        }

        this.loadFullQuality(urls.full);
      })
      .catch((error: unknown) => {
        if (this.disposed) {
          return;
        }

        this.fireError(normalizeError(error));
        this.showFallback();
      });
  }

  private loadFullQuality(fullUrl: string): void {
    const scene = this.scene;
    if (!scene) {
      return;
    }

    const fullMesh = new SplatMesh({
      downsample: this.downsample,
      url: fullUrl,
      worker: true,
    } as never) as SceneMesh;

    fullMesh.quaternion.set(1, 0, 0, 0);

    void fullMesh.initialized
      .then(() => {
        if (this.disposed || !this.scene) {
          fullMesh.dispose?.();
          return;
        }

        this.fullMesh = fullMesh;
        this.scene.add(fullMesh);
        this.startRevealTransition();
      })
      .catch(() => {
        if (this.disposed) {
          return;
        }

        this.fireLoad();
      });
  }

  private startRevealTransition(): void {
    const lowMesh = this.previewMesh;
    const highMesh = this.fullMesh;
    if (!lowMesh || !highMesh) {
      this.fireLoad();
      return;
    }

    const { center, edgeSoftness, maxRadius, ringWidth } = this.getRevealParams(highMesh);
    const radius = dyno.dynoFloat(0, "landingRevealRadius");
    const centerUniform = dyno.dynoVec3([center.x, center.y, center.z], "landingRevealCenter");
    const edgeSoftnessUniform = dyno.dynoFloat(edgeSoftness, "landingRevealEdgeSoftness");
    const ringColor = dyno.dynoVec3(RING_COLOR, "landingRevealRingColor");
    const ringStrength = dyno.dynoFloat(PROGRESSIVE_REVEAL.ringStrength, "landingRevealRingStrength");
    const ringWidthUniform = dyno.dynoFloat(ringWidth, "landingRevealRingWidth");

    lowMesh.worldModifier = createRadialTransitionModifier({
      center: centerUniform,
      edgeSoftness: edgeSoftnessUniform,
      isHighRes: false,
      radius,
      ringColor,
      ringStrength,
      ringWidth: ringWidthUniform,
    });
    lowMesh.updateGenerator?.();

    highMesh.worldModifier = createRadialTransitionModifier({
      center: centerUniform,
      edgeSoftness: edgeSoftnessUniform,
      isHighRes: true,
      radius,
      ringColor,
      ringStrength,
      ringWidth: ringWidthUniform,
    });
    highMesh.updateGenerator?.();

    const startedAt = performance.now();

    const tick = () => {
      if (this.disposed || !this.fullMesh) {
        return;
      }

      const elapsed = performance.now() - startedAt;
      const progress = Math.min(1, elapsed / PROGRESSIVE_REVEAL.durationMs);
      const eased =
        progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      radius.value = eased * maxRadius;
      lowMesh.needsUpdate = true;
      highMesh.needsUpdate = true;
      this.render();

      if (progress < 1) {
        this.revealFrameId = requestAnimationFrame(tick);
        return;
      }

      if (this.scene?.children.includes(lowMesh)) {
        this.scene.remove(lowMesh);
      }

      lowMesh.dispose?.();
      this.previewMesh = null;
      highMesh.worldModifier = undefined;
      highMesh.updateGenerator?.();
      this.revealFrameId = null;
      this.fireLoad();
    };

    this.revealFrameId = requestAnimationFrame(tick);
  }

  private getRevealParams(mesh: SceneMesh): {
    center: THREE.Vector3;
    edgeSoftness: number;
    maxRadius: number;
    ringWidth: number;
  } {
    try {
      const box = mesh.getBoundingBox?.(true) ?? new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      const corners = [
        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
        new THREE.Vector3(box.min.x, box.min.y, box.max.z),
        new THREE.Vector3(box.min.x, box.max.y, box.min.z),
        new THREE.Vector3(box.min.x, box.max.y, box.max.z),
        new THREE.Vector3(box.max.x, box.min.y, box.min.z),
        new THREE.Vector3(box.max.x, box.min.y, box.max.z),
        new THREE.Vector3(box.max.x, box.max.y, box.min.z),
        new THREE.Vector3(box.max.x, box.max.y, box.max.z),
      ];
      const maxDistance = corners.reduce((largest, corner) => Math.max(largest, corner.distanceTo(center)), 0);

      if (Number.isFinite(maxDistance) && maxDistance > 0) {
        const maxRadius = maxDistance * 1.15;
        return {
          center,
          edgeSoftness: maxRadius * 0.04,
          maxRadius,
          ringWidth: maxRadius * 0.025,
        };
      }
    } catch {
      // Ignore and fall back to defaults.
    }

    return {
      center: new THREE.Vector3(),
      edgeSoftness: 4,
      maxRadius: PROGRESSIVE_REVEAL.fallbackMaxRadius,
      ringWidth: 2,
    };
  }

  private fireError(error: Error): void {
    this.errorCallbacks.forEach((callback) => callback(error));
  }

  private fireLoad(): void {
    this.loadCallbacks.forEach((callback) => callback());
  }

  private showFallback(): void {
    if (this.container) {
      this.container.style.background = FALLBACK_GRADIENT;
    }
  }

  private teardown(): void {
    if (this.revealFrameId !== null) {
      cancelAnimationFrame(this.revealFrameId);
      this.revealFrameId = null;
    }

    this.previewMesh?.dispose?.();
    this.fullMesh?.dispose?.();

    if (this.renderer) {
      this.renderer.domElement.removeEventListener("webglcontextlost", this.onContextLost);
      this.renderer.domElement.removeEventListener("webglcontextrestored", this.onContextRestored);
      this.renderer.dispose();
    }

    if (this.container) {
      this.container.innerHTML = "";
    }

    this.previewMesh = null;
    this.fullMesh = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
  }

  private onResize = (): void => {
    if (!this.camera || !this.renderer || !this.container) {
      return;
    }

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.render();
  };

  private onVisibilityChange = (): void => {
    this.tabHidden = document.hidden;
    if (!this.tabHidden) {
      this.render();
    }
  };

  private onContextLost = (event: Event): void => {
    event.preventDefault();
    this.contextLossCount += 1;

    if (this.contextLossCount > 1) {
      this.fireError(new Error("WebGL context lost"));
      this.showFallback();
    }
  };

  private onContextRestored = (): void => {
    if (this.disposed || !this.container) {
      return;
    }

    this.teardown();
    this.contextLossCount = 0;
    this.initWebGL();
  };
}
