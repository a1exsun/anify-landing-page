import { SplatMesh, dyno } from "@sparkjsdev/spark";

export function createPreviewPointModifier(): any {
  const pointSize = dyno.dynoFloat(0.34, "previewPointSize");
  const minPointSize = dyno.dynoFloat(0.006, "previewMinPointSize");
  const pulseSpeed = dyno.dynoFloat(1.7, "previewPulseSpeed");
  const pulseAmount = dyno.dynoFloat(0.18, "previewPulseAmount");
  const sparsity = dyno.dynoFloat(0.76, "previewSparsity");
  const jitterAmount = dyno.dynoFloat(0.026, "previewJitterAmount");
  const glowIntensity = dyno.dynoFloat(0.08, "previewGlowIntensity");
  const grayscaleMix = dyno.dynoFloat(0.15, "previewGrayscaleMix");
  const opacityScale = dyno.dynoFloat(0.72, "previewOpacityScale");

  const zero = dyno.dynoConst("float", 0);
  const one = dyno.dynoConst("float", 1);
  const two = dyno.dynoConst("float", 2);
  const twoPi = dyno.dynoConst("float", Math.PI * 2);
  const oneVec3 = dyno.dynoConst("vec3", [1, 1, 1]);
  const tintColor = dyno.dynoConst("vec3", [0.87, 0.92, 1.0]);
  const glowTint = dyno.dynoConst("vec3", [0.06, 0.08, 0.12]);
  const glowGain = dyno.dynoConst("float", 0.35);
  const oneThird = dyno.dynoConst("float", 1 / 3);

  return dyno.dynoBlock({ gsplat: dyno.Gsplat }, { gsplat: dyno.Gsplat }, ({ gsplat }) => {
    if (!gsplat) {
      throw new Error("No gsplat input");
    }

    const splat = dyno.splitGsplat(gsplat).outputs;
    const scaleParts = dyno.split(splat.scales).outputs;
    const rgbParts = dyno.split(splat.rgb).outputs;

    const hash = dyno.hashFloat(splat.index);
    const hashVec = dyno.hashVec3(splat.index);
    const signedHashVec = dyno.sub(dyno.mul(hashVec, two), oneVec3);
    const phase = dyno.mul(hash, twoPi);
    const pulse = dyno.add(
      one,
      dyno.mul(
        dyno.sin(dyno.add(dyno.mul(SplatMesh.dynoTime, pulseSpeed), phase)),
        pulseAmount,
      ),
    );

    const jitter = dyno.mul(jitterAmount, pulse);
    const center = dyno.add(splat.center, dyno.mul(signedHashVec, jitter));

    const avgScale = dyno.mul(
      dyno.add(dyno.add(scaleParts.x, scaleParts.y), scaleParts.z),
      oneThird,
    );
    const pointScale = dyno.max(dyno.mul(avgScale, dyno.mul(pointSize, pulse)), minPointSize);
    const scales = dyno.combine({ vectorType: "vec3", x: pointScale, y: pointScale, z: pointScale });

    const gray = dyno.mul(dyno.add(dyno.add(rgbParts.x, rgbParts.y), rgbParts.z), oneThird);
    const grayRgb = dyno.combine({ vectorType: "vec3", x: gray, y: gray, z: gray });
    const stylizedRgb = dyno.mix(splat.rgb, grayRgb, grayscaleMix);
    const glow = dyno.mul(dyno.sub(one, hash), glowIntensity);
    const glowRgb = dyno.mul(glowTint, dyno.mul(glow, glowGain));
    const baseRgb = dyno.mix(stylizedRgb, tintColor, glowIntensity);
    const rgb = dyno.add(baseRgb, glowRgb);

    const visible = dyno.lessThan(hash, sparsity);
    const opacity = dyno.select(visible, dyno.mul(dyno.mul(splat.opacity, opacityScale), pulse), zero);

    return { gsplat: dyno.combineGsplat({ gsplat, center, scales, opacity, rgb }) };
  });
}
