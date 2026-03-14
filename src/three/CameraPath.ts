import * as THREE from "three";

interface CameraPathConfig {
  angles: number[];
  lookAtPoints?: THREE.Vector3[];
}

const HOME_GAUSS_ORBIT_PIVOT = new THREE.Vector3(0, 0, 0);
const HOME_GAUSS_ORBIT_RADIUS = 1.2;

// Mirrors the homepage orbit system instead of using ad-hoc 3D points.
// The intermediate angles are derived from the main app's page offsets so
// the landing page scroll follows the same camera language.
const DEFAULT_CONFIG: CameraPathConfig = {
  angles: [0, 1.3, 2.5, 4.45, 6.05],
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function createOrbitPoint(angle: number, radius: number): THREE.Vector3 {
  return new THREE.Vector3(
    HOME_GAUSS_ORBIT_PIVOT.x + radius * Math.sin(angle),
    HOME_GAUSS_ORBIT_PIVOT.y,
    HOME_GAUSS_ORBIT_PIVOT.z + radius * Math.cos(angle),
  );
}

export class CameraPath {
  private lookAtCurve: THREE.CatmullRomCurve3;
  private positionCurve: THREE.CatmullRomCurve3;

  constructor(config: CameraPathConfig = DEFAULT_CONFIG, mobileDistanceScale = 1.15) {
    const isMobile =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0) &&
      window.innerWidth <= 1024;

    const orbitRadius = HOME_GAUSS_ORBIT_RADIUS * (isMobile ? mobileDistanceScale : 1);
    const positionPoints = config.angles.map((angle) => createOrbitPoint(angle, orbitRadius));
    const lookAtPoints =
      config.lookAtPoints?.map((point) => point.clone()) ??
      config.angles.map(() => HOME_GAUSS_ORBIT_PIVOT.clone());

    this.positionCurve = new THREE.CatmullRomCurve3(positionPoints, false, "catmullrom", 0.5);
    this.lookAtCurve = new THREE.CatmullRomCurve3(lookAtPoints, false, "catmullrom", 0.5);
  }

  getPositionAt(t: number): THREE.Vector3 {
    return this.positionCurve.getPointAt(clamp01(t));
  }

  getLookAtAt(t: number): THREE.Vector3 {
    return this.lookAtCurve.getPointAt(clamp01(t));
  }
}
