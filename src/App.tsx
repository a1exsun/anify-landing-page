import { useCallback, useEffect, useRef } from "react";

import { FeaturesSection } from "@/components/FeaturesSection";
import { HeroSection } from "@/components/HeroSection";
import { HighlightsSection } from "@/components/HighlightsSection";
import { RoadmapSection } from "@/components/RoadmapSection";
import { SplatCanvas } from "@/components/SplatCanvas";
import { ScrollAnimator } from "@/three/ScrollAnimator";
import type { SplatScene } from "@/three/SplatScene";

export default function App() {
  const animatorRef = useRef<ScrollAnimator | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSceneReady = useCallback((scene: SplatScene) => {
    const camera = scene.getCamera();
    const scrollContainer = scrollRef.current;

    if (!camera || !scrollContainer) {
      return;
    }

    animatorRef.current?.dispose();
    animatorRef.current = new ScrollAnimator(camera, () => scene.render());
    animatorRef.current.attach(scrollContainer);
  }, []);

  useEffect(() => {
    return () => {
      animatorRef.current?.dispose();
      animatorRef.current = null;
    };
  }, []);

  return (
    <>
      <SplatCanvas onSceneReady={handleSceneReady} />
      <div
        ref={scrollRef}
        className="relative z-10"
      >
        <HeroSection />
        <HighlightsSection />
        <FeaturesSection />
        <RoadmapSection />
      </div>
    </>
  );
}
