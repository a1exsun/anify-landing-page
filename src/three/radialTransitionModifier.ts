import { dyno } from "@sparkjsdev/spark";

interface RadialTransitionModifierOptions {
  center: ReturnType<typeof dyno.dynoVec3>;
  edgeSoftness: ReturnType<typeof dyno.dynoFloat>;
  isHighRes: boolean;
  radius: ReturnType<typeof dyno.dynoFloat>;
  ringColor: ReturnType<typeof dyno.dynoVec3>;
  ringStrength: ReturnType<typeof dyno.dynoFloat>;
  ringWidth: ReturnType<typeof dyno.dynoFloat>;
}

export function createRadialTransitionModifier({
  center,
  edgeSoftness,
  isHighRes,
  radius,
  ringColor,
  ringStrength,
  ringWidth,
}: RadialTransitionModifierOptions): any {
  const zero = dyno.dynoConst("float", 0);
  const one = dyno.dynoConst("float", 1);

  return dyno.dynoBlock({ gsplat: dyno.Gsplat }, { gsplat: dyno.Gsplat }, ({ gsplat }) => {
    if (!gsplat) {
      throw new Error("No gsplat input");
    }

    const splat = dyno.splitGsplat(gsplat).outputs;
    const dist = dyno.distance(splat.center, center);

    const edgeStart = dyno.sub(radius, edgeSoftness);
    const edgeEnd = dyno.add(radius, edgeSoftness);
    const outsideMask = dyno.smoothstep(edgeStart, edgeEnd, dist);
    const visibility = isHighRes ? dyno.sub(one, outsideMask) : outsideMask;

    const ringDistance = dyno.abs(dyno.sub(dist, radius));
    const ringMask = dyno.sub(one, dyno.smoothstep(zero, ringWidth, ringDistance));
    const ringMix = dyno.mul(ringMask, ringStrength);

    const rgb = dyno.mix(splat.rgb, ringColor, ringMix);
    const opacity = dyno.mul(splat.opacity, visibility);

    return { gsplat: dyno.combineGsplat({ gsplat, opacity, rgb }) };
  });
}
