import { useEffect, useEffectEvent, useRef, useState } from "react";

import { SplatScene } from "@/three/SplatScene";

const DEFAULT_SPLAT_URL = "https://oss.anify.ai/gs/3b5320a4-72b4-4eb4-98fe-13c78ae1c070_ceramic_500k.spz";
const FALLBACK_GRADIENT = "linear-gradient(135deg, #0a0a1a, #1a1a2e)";

interface SplatCanvasProps {
  onSceneReady?: (scene: SplatScene) => void;
  splatUrl?: string;
}

export function SplatCanvas({ onSceneReady, splatUrl = DEFAULT_SPLAT_URL }: SplatCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);
  const [error, setError] = useState(false);

  const handleSceneReady = useEffectEvent((scene: SplatScene) => {
    if (readyRef.current) {
      return;
    }

    readyRef.current = true;
    onSceneReady?.(scene);
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    readyRef.current = false;
    setError(false);

    const scene = new SplatScene();
    scene.onError(() => setError(true));
    scene.onLoad(() => handleSceneReady(scene));
    scene.init(container, splatUrl);
    handleSceneReady(scene);

    return () => {
      scene.dispose();
      readyRef.current = false;
    };
  }, [handleSceneReady, splatUrl]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0"
      style={error ? { background: FALLBACK_GRADIENT } : undefined}
    />
  );
}
