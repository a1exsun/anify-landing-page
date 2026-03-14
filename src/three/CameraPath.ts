import * as THREE from "three";

/** Keyframe order: Hero → Features → Highlights → Roadmap → Play */
export interface CameraKeyframeSerialized {
  px: number;
  py: number;
  pz: number;
  qx: number;
  qy: number;
  qz: number;
  qw: number;
}

const DEFAULT_KEYFRAMES: CameraKeyframeSerialized[] = [
  { px: 0.0000, py: 0.2000, pz: 0.7908, qx: -0.02832, qy: -0.02947, qz: -0.00084, qw: 0.99916 },
  { px: -0.8330, py: 0.2099, pz: -1.4958, qx: 0.00127, qy: -0.30188, qz: 0.00040, qw: 0.95334 },
  { px: -0.1344, py: 0.1185, pz: -2.1326, qx: -0.01973, qy: -0.82174, qz: -0.02850, qw: 0.56880 },
  { px: -0.9445, py: 0.0981, pz: -2.5666, qx: 0.00266, qy: -0.95836, qz: 0.00894, qw: 0.28543 },
  { px: -0.1814, py: 0.1742, pz: -0.4836, qx: 0.00178, qy: -0.99813, qz: 0.04928, qw: 0.03608 },
];

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export class CameraPath {
  private positionCurve: THREE.CatmullRomCurve3;
  private quaternions: THREE.Quaternion[];

  constructor(keyframes: CameraKeyframeSerialized[] = DEFAULT_KEYFRAMES) {
    const pts = keyframes.map((k) => new THREE.Vector3(k.px, k.py, k.pz));
    this.positionCurve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    this.quaternions = keyframes.map(
      (k) => new THREE.Quaternion(k.qx, k.qy, k.qz, k.qw).normalize(),
    );
  }

  getPoseAt(t: number): { position: THREE.Vector3; quaternion: THREE.Quaternion } {
    const u = clamp01(t);
    const position = this.positionCurve.getPointAt(u);
    const n = this.quaternions.length;
    if (n === 0) {
      return { position, quaternion: new THREE.Quaternion() };
    }
    if (n === 1) {
      return { position, quaternion: this.quaternions[0]!.clone() };
    }
    const f = u * (n - 1);
    const i = Math.min(Math.floor(f), n - 2);
    const frac = f - i;
    const q = new THREE.Quaternion().slerpQuaternions(
      this.quaternions[i]!,
      this.quaternions[i + 1]!,
      frac,
    );
    return { position, quaternion: q };
  }
}
