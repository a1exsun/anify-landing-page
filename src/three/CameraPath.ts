import * as THREE from "three";

interface CameraPathConfig {
  lookAtPoints: THREE.Vector3[];
  positionPoints: THREE.Vector3[];
}

const DEFAULT_CONFIG: CameraPathConfig = {
  positionPoints: [
    new THREE.Vector3(0, 0.5, 3),
    new THREE.Vector3(2.1, 0.8, 2.1),
    new THREE.Vector3(3.2, 1.1, 0.2),
    new THREE.Vector3(2.1, 1.35, -2.2),
    new THREE.Vector3(0, 0.5, 3),
  ],
  lookAtPoints: [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.2, 0.15, 0),
    new THREE.Vector3(0.1, 0.3, -0.1),
    new THREE.Vector3(0, 0.45, 0),
    new THREE.Vector3(0, 0, 0),
  ],
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export class CameraPath {
  private lookAtCurve: THREE.CatmullRomCurve3;
  private positionCurve: THREE.CatmullRomCurve3;

  constructor(config: CameraPathConfig = DEFAULT_CONFIG, mobileDistanceScale = 1.15) {
    const isMobile =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0) &&
      window.innerWidth <= 1024;

    const positionPoints = isMobile
      ? config.positionPoints.map((point) => point.clone().multiplyScalar(mobileDistanceScale))
      : config.positionPoints.map((point) => point.clone());

    this.positionCurve = new THREE.CatmullRomCurve3(positionPoints, false, "catmullrom", 0.5);
    this.lookAtCurve = new THREE.CatmullRomCurve3(
      config.lookAtPoints.map((point) => point.clone()),
      false,
      "catmullrom",
      0.5,
    );
  }

  getPositionAt(t: number): THREE.Vector3 {
    return this.positionCurve.getPointAt(clamp01(t));
  }

  getLookAtAt(t: number): THREE.Vector3 {
    return this.lookAtCurve.getPointAt(clamp01(t));
  }
}
