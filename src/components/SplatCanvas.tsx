import { useEffect, useRef, useState } from "react";

import { SplatScene } from "@/three/SplatScene";

const DEFAULT_SPLAT_URL =
  `${import.meta.env.BASE_URL}gs/elder-tree-hollow_500k.spz`;
const FALLBACK_GRADIENT = "linear-gradient(135deg, #0a0a1a, #1a1a2e)";

interface SplatCanvasProps {
  onSceneReady?: (scene: SplatScene) => void;
  splatUrl?: string;
}

export function SplatCanvas({
  splatUrl = DEFAULT_SPLAT_URL,
  onSceneReady,
}: SplatCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const scene = new SplatScene();
    readyRef.current = false;
    setHasError(false);

    scene.onError(() => {
      setHasError(true);
    });
    scene.onLoad(() => {
      if (readyRef.current) {
        return;
      }

      readyRef.current = true;
      onSceneReady?.(scene);
    });
    scene.init(container, splatUrl);

    return () => {
      readyRef.current = false;
      scene.dispose();
    };
  }, [onSceneReady, splatUrl]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0"
      style={hasError ? { background: FALLBACK_GRADIENT } : undefined}
    />
  );
}
