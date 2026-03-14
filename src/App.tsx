import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import { FeaturesSection } from "@/components/FeaturesSection";
import { HeroSection } from "@/components/HeroSection";
import { HighlightsSection } from "@/components/HighlightsSection";
import { PlayCtaSection } from "@/components/PlayCtaSection";
import { RoadmapSection } from "@/components/RoadmapSection";
import { SiteHeader } from "@/components/SiteHeader";
import { SplatCanvas } from "@/components/SplatCanvas";
import { LandingDebugPanel } from "@/dev/LandingDebugPanel";
import { getTargetScroll, smoothNavScrollToHash } from "@/lib/smoothNavScroll";
import { ScrollAnimator } from "@/three/ScrollAnimator";
import { isLandingDebugMode, type SplatScene } from "@/three/SplatScene";

gsap.registerPlugin(ScrollToPlugin);

export const NavContext = createContext<((hash: string) => void) | null>(null);

export default function App() {
  const animatorRef = useRef<ScrollAnimator | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SplatScene | null>(null);
  const [, setSceneTick] = useState(0);
  const debug = isLandingDebugMode();

  const navigateToSection = useCallback((hash: string) => {
    const target = getTargetScroll(hash);
    if (!target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      smoothNavScrollToHash(hash);
      return;
    }
    const animator = animatorRef.current;
    const range = animator?.getScrollRange();
    if (!range || !animator) {
      smoothNavScrollToHash(hash);
      return;
    }
    const currentProgress = animator.getProgressFromScroll(window.scrollY);
    const targetProgress = animator.getProgressFromScroll(target.y);
    gsap.killTweensOf(window);
    animator.animateDirectToProgress(currentProgress, targetProgress, target.duration, "power2.inOut");
    gsap.to(window, {
      duration: target.duration,
      scrollTo: { y: target.y, autoKill: true },
      ease: "power2.inOut",
    });
  }, []);

  const handleSceneReady = useCallback(
    (scene: SplatScene) => {
      sceneRef.current = scene;
      setSceneTick((n) => n + 1);
      const camera = scene.getCamera();
      const scrollContainer = scrollRef.current;

      if (!camera || !scrollContainer) {
        return;
      }

      animatorRef.current?.dispose();
      animatorRef.current = null;
      if (debug) {
        return;
      }
      animatorRef.current = new ScrollAnimator(camera, () => scene.render());
      animatorRef.current.attach(scrollContainer);
    },
    [debug],
  );

  useEffect(() => {
    return () => {
      animatorRef.current?.dispose();
      animatorRef.current = null;
    };
  }, []);

  return (
    <NavContext.Provider value={navigateToSection}>
      <SplatCanvas onSceneReady={handleSceneReady} />
      <SiteHeader />
      <div
        ref={scrollRef}
        data-scroll-root
        className={`relative z-10 ${debug ? "landing-debug-scroll pointer-events-none" : ""}`}
      >
        <HeroSection />
        <FeaturesSection />
        <HighlightsSection />
        <RoadmapSection />
        <PlayCtaSection />
      </div>
      {debug ? <LandingDebugPanel scene={sceneRef.current} /> : null}
    </NavContext.Provider>
  );
}
