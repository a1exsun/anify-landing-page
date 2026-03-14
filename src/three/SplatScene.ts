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

type SplatMeshInstance = SplatMesh & {
  initialized: Promise<unknown>;
  needsUpdate?: boolean;
  objectModifier?: unknown;
  updateGenerator?: () => void;
  worldModifier?: unknown;
};

function getProgressiveUrls(splatUrl: string): { full: string; preview: string } {
  if (splatUrl.endsWith("_500k.spz")) {
    const base = splatUrl.slice(0, -"_500k.spz".length);
    return { preview: `${base}_100k.spz`, full: splatUrl };
  }

  return { preview: splatUrl, full: splatUrl };
}

function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === "string" ? error : "Unknown splat loading error");
}

export function isLandingDebugMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).get("debug") === "1") return true;
    if (window.localStorage.getItem("anify-landing-debug") === "1") return true;
  } catch {
    /* ignore */
  }
  return false;
}

export class SplatScene {
  private camera: THREE.PerspectiveCamera | null = null;
  private container: HTMLDivElement | null = null;
  private contextLostRetried = false;
  private disposed = false;
  private dragRafId: number | null = null;
  private dragLastTime = 0;
  private debugMode = false;
  private keys = new Set<string>();
  private lookYaw = 0;
  private lookPitch = 0;
  private dragging = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private boundKeyDown!: (e: KeyboardEvent) => void;
  private boundKeyUp!: (e: KeyboardEvent) => void;
  private boundPointerDown!: (e: PointerEvent) => void;
  private boundPointerMove!: (e: PointerEvent) => void;
  private boundPointerUp!: () => void;
  private downsample = isOldIOS() ? 4 : 2;
  private errorCallbacks: Array<(err: Error) => void> = [];
  private fullMesh: SplatMeshInstance | null = null;
  private loadCallbacks: Array<() => void> = [];
  private previewMesh: SplatMeshInstance | null = null;
  private readyNotified = false;
  private renderer: THREE.WebGLRenderer | null = null;
  private revealFrameId: number | null = null;
  private scene: THREE.Scene | null = null;
  private splatUrl = "";
  private tabHidden = false;

  private readonly moveSpeed = 2.2;
  private readonly mouseSens = 0.004;

  onLoad(cb: () => void): void {
    this.loadCallbacks.push(cb);
  }

  onError(cb: (err: Error) => void): void {
    this.errorCallbacks.push(cb);
  }

  init(container: HTMLDivElement, splatUrl: string): void {
    this.container = container;
    this.splatUrl = splatUrl;
    this.initWebGL();
    if (this.renderer) {
      this.loadSplat();
    }
  }

  getCamera(): THREE.PerspectiveCamera | null {
    return this.camera;
  }

  isReady(): boolean {
    return this.previewMesh !== null || this.fullMesh !== null;
  }

  render(): void {
    if (this.disposed || this.tabHidden || !this.renderer || !this.scene || !this.camera) {
      return;
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.disposed = true;

    if (this.dragRafId !== null) {
      cancelAnimationFrame(this.dragRafId);
      this.dragRafId = null;
    }

    if (this.debugMode && this.renderer?.domElement) {
      const el = this.renderer.domElement;
      window.removeEventListener("keydown", this.boundKeyDown);
      window.removeEventListener("keyup", this.boundKeyUp);
      el.removeEventListener("pointerdown", this.boundPointerDown);
      el.removeEventListener("pointermove", this.boundPointerMove);
      window.removeEventListener("pointerup", this.boundPointerUp);
      window.removeEventListener("blur", this.boundPointerUp);
    }

    if (this.revealFrameId !== null) {
      cancelAnimationFrame(this.revealFrameId);
      this.revealFrameId = null;
    }

    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);

    this.previewMesh?.dispose?.();
    this.fullMesh?.dispose?.();

    if (this.renderer) {
      this.renderer.domElement.removeEventListener("webglcontextlost", this.onContextLost);
      this.renderer.domElement.removeEventListener("webglcontextrestored", this.onContextRestored);
      this.renderer.dispose();
    }

    if (this.container && this.renderer?.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    } else if (this.container) {
      this.container.innerHTML = "";
    }

    this.camera = null;
    this.fullMesh = null;
    this.previewMesh = null;
    this.renderer = null;
    this.scene = null;
  }

  private initWebGL(): void {
    if (!this.container) {
      return;
    }

    const oldIOS = isOldIOS();
    const isMobile = isMobileDevice();
    const pixelRatio = oldIOS ? 1.0 : Math.min(window.devicePixelRatio, 1.5);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      isMobile ? 80 : 70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

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
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.domElement.addEventListener("webglcontextlost", this.onContextLost);
    this.renderer.domElement.addEventListener("webglcontextrestored", this.onContextRestored);
    this.container.appendChild(this.renderer.domElement);

    this.debugMode = isLandingDebugMode();
    if (this.debugMode && this.renderer.domElement) {
      const el = this.renderer.domElement;
      el.style.cursor = "grab";
      this.lookYaw = 0;
      this.lookPitch = 0;
      this.camera.position.set(0, 0.2, 1.35);
      this.applyLookRotation();

      this.boundKeyDown = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase();
        if (["w", "a", "s", "d", "q", "e"].includes(k)) {
          this.keys.add(k);
          e.preventDefault();
        }
      };
      this.boundKeyUp = (e: KeyboardEvent) => {
        this.keys.delete(e.key.toLowerCase());
      };
      this.boundPointerDown = (e: PointerEvent) => {
        if (e.button !== 0) return;
        this.dragging = true;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
        el.setPointerCapture(e.pointerId);
        el.style.cursor = "grabbing";
      };
      this.boundPointerMove = (e: PointerEvent) => {
        if (!this.dragging) return;
        const dx = e.clientX - this.lastPointerX;
        const dy = e.clientY - this.lastPointerY;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
        this.lookYaw -= dx * this.mouseSens;
        this.lookPitch -= dy * this.mouseSens;
        const lim = Math.PI / 2 - 0.08;
        this.lookPitch = Math.max(-lim, Math.min(lim, this.lookPitch));
        this.applyLookRotation();
      };
      this.boundPointerUp = () => {
        this.dragging = false;
        el.style.cursor = "grab";
      };

      window.addEventListener("keydown", this.boundKeyDown);
      window.addEventListener("keyup", this.boundKeyUp);
      el.addEventListener("pointerdown", this.boundPointerDown);
      el.addEventListener("pointermove", this.boundPointerMove);
      window.addEventListener("pointerup", this.boundPointerUp);
      window.addEventListener("blur", this.boundPointerUp);
    }

    window.addEventListener("resize", this.onResize);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  private applyLookRotation(): void {
    if (!this.camera) return;
    const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.lookYaw);
    const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.lookPitch);
    this.camera.quaternion.copy(qYaw).multiply(qPitch);
  }

  private loadSplat(): void {
    if (!this.scene) {
      return;
    }

    const urls = getProgressiveUrls(this.splatUrl);
    this.previewMesh = new SplatMesh({
      downsample: this.downsample,
      objectModifier: createPreviewPointModifier(),
      url: urls.preview,
      worker: true,
    } as never) as SplatMeshInstance;
    this.previewMesh.quaternion.set(1, 0, 0, 0);
    this.scene.add(this.previewMesh);

    void this.previewMesh.initialized
      .then(() => {
        if (this.disposed) {
          return;
        }

        this.notifyReady();
        this.render();
        if (urls.full !== urls.preview) {
          this.loadFullQuality(urls.full);
          return;
        }

        this.fullMesh = this.previewMesh;
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
    this.fullMesh = new SplatMesh({
      downsample: this.downsample,
      url: fullUrl,
      worker: true,
    } as never) as SplatMeshInstance;
    this.fullMesh.quaternion.set(1, 0, 0, 0);

    void this.fullMesh.initialized
      .then(() => {
        if (this.disposed || !this.scene || !this.fullMesh) {
          return;
        }

        this.scene.add(this.fullMesh);
        this.startRevealTransition();
      })
      .catch(() => {
        if (this.disposed) {
          return;
        }

        this.fireLoadCallbacks();
      });
  }

  private startRevealTransition(): void {
    const lowMesh = this.previewMesh;
    const highMesh = this.fullMesh;

    if (!this.scene || !lowMesh || !highMesh || lowMesh === highMesh) {
      this.fireLoadCallbacks();
      return;
    }

    const box = new THREE.Box3().setFromObject(highMesh);
    const center = box.getCenter(new THREE.Vector3());
    const maxRadius = this.resolveMaxRadius(box, center);
    const radius = dyno.dynoFloat(0, "landingRevealRadius");
    const revealCenter = dyno.dynoVec3([center.x, center.y, center.z], "landingRevealCenter");
    const edgeSoftness = dyno.dynoFloat(maxRadius * 0.08, "landingRevealEdgeSoftness");
    const ringStrength = dyno.dynoFloat(PROGRESSIVE_REVEAL.ringStrength, "landingRevealRingStrength");
    const ringWidth = dyno.dynoFloat(maxRadius * 0.04, "landingRevealRingWidth");
    const ringColor = dyno.dynoVec3(RING_COLOR, "landingRevealRingColor");

    lowMesh.worldModifier = createRadialTransitionModifier({
      center: revealCenter,
      edgeSoftness,
      isHighRes: false,
      radius,
      ringColor,
      ringStrength,
      ringWidth,
    });
    lowMesh.updateGenerator?.();

    highMesh.worldModifier = createRadialTransitionModifier({
      center: revealCenter,
      edgeSoftness,
      isHighRes: true,
      radius,
      ringColor,
      ringStrength,
      ringWidth,
    });
    highMesh.updateGenerator?.();

    const startedAt = performance.now();

    const tick = () => {
      if (this.disposed) {
        return;
      }

      const elapsed = performance.now() - startedAt;
      const progress = Math.min(1, elapsed / PROGRESSIVE_REVEAL.durationMs);
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

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
      this.fireLoadCallbacks();
    };

    this.revealFrameId = requestAnimationFrame(tick);
  }

  private resolveMaxRadius(box: THREE.Box3, center: THREE.Vector3): number {
    if (box.isEmpty()) {
      return PROGRESSIVE_REVEAL.fallbackMaxRadius;
    }

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

    const maxCornerDistance = corners.reduce((maxDistance, corner) => {
      return Math.max(maxDistance, corner.distanceTo(center));
    }, 0);

    return maxCornerDistance > 0 ? maxCornerDistance : PROGRESSIVE_REVEAL.fallbackMaxRadius;
  }

  private notifyReady(): void {
    if (this.readyNotified) {
      return;
    }

    this.readyNotified = true;
    if (this.debugMode) {
      this.startDebugLoop();
    }
    this.fireLoadCallbacks();
  }

  private startDebugLoop(): void {
    if (!this.debugMode || !this.camera || !this.renderer) {
      return;
    }
    this.dragLastTime = performance.now();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    const loop = () => {
      if (this.disposed || !this.camera || !this.renderer) {
        return;
      }
      const now = performance.now();
      const dt = Math.min(0.05, (now - this.dragLastTime) / 1000);
      this.dragLastTime = now;

      this.camera.getWorldDirection(forward);
      right.crossVectors(forward, up).normalize();
      const v = this.moveSpeed * dt;
      if (this.keys.has("w")) this.camera.position.addScaledVector(forward, v);
      if (this.keys.has("s")) this.camera.position.addScaledVector(forward, -v);
      if (this.keys.has("a")) this.camera.position.addScaledVector(right, -v);
      if (this.keys.has("d")) this.camera.position.addScaledVector(right, v);
      if (this.keys.has("q")) this.camera.position.y -= v;
      if (this.keys.has("e")) this.camera.position.y += v;

      this.render();
      this.dragRafId = requestAnimationFrame(loop);
    };
    this.dragRafId = requestAnimationFrame(loop);
  }

  private fireLoadCallbacks(): void {
    this.loadCallbacks.forEach((cb) => cb());
  }

  private fireError(err: Error): void {
    this.errorCallbacks.forEach((cb) => cb(err));
  }

  private showFallback(): void {
    if (this.container) {
      this.container.style.background = FALLBACK_GRADIENT;
    }
  }

  private onResize = (): void => {
    if (!this.camera || !this.renderer) {
      return;
    }

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
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

    if (!this.contextLostRetried) {
      this.contextLostRetried = true;
      return;
    }

    this.fireError(new Error("WebGL context lost"));
    this.showFallback();
  };

  private onContextRestored = (): void => {
    const container = this.container;
    const splatUrl = this.splatUrl;

    if (!container) {
      return;
    }

    this.dispose();
    this.disposed = false;
    this.contextLostRetried = false;
    this.readyNotified = false;
    this.container = container;
    this.splatUrl = splatUrl;
    this.initWebGL();
    if (this.renderer) {
      this.loadSplat();
    }
  };
}
