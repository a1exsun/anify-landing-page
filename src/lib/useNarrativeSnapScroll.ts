import { useEffect, useRef } from "react";

import {
  getNarrativeSnapTargets,
  type TargetScroll,
} from "@/lib/smoothNavScroll";

type ScrollToTarget = (
  target: TargetScroll,
  options?: { onComplete?: () => void },
) => void;

interface NarrativeSnapScrollOptions {
  enabled: boolean;
  scrollToTarget: ScrollToTarget;
}

const WHEEL_DELTA_THRESHOLD = 24;
const TOUCH_DELTA_THRESHOLD = 42;
const TARGET_TOLERANCE_PX = 14;
const RELEASE_DELAY_MS = 120;
const INPUT_QUIET_MS = 180;

function normalizeWheelDelta(event: WheelEvent): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 18;
  }
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * window.innerHeight;
  }
  return event.deltaY;
}

function findTarget(direction: 1 | -1): TargetScroll | null {
  const targets = getNarrativeSnapTargets();
  const currentY = window.scrollY;
  if (direction > 0) {
    return (
      targets.find((target) => target.y > currentY + TARGET_TOLERANCE_PX) ?? null
    );
  }
  for (let i = targets.length - 1; i >= 0; i -= 1) {
    const target = targets[i];
    if (target && target.y < currentY - TARGET_TOLERANCE_PX) {
      return target;
    }
  }
  return null;
}

function isEditableEventTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable='true'], [contenteditable='']",
    ),
  );
}

export function useNarrativeSnapScroll({
  enabled,
  scrollToTarget,
}: NarrativeSnapScrollOptions): void {
  const isAnimatingRef = useRef(false);
  const wheelDeltaRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchTriggeredRef = useRef(false);
  const releaseTimerRef = useRef<number | null>(null);
  const lastInputAtRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const release = () => {
      if (releaseTimerRef.current != null) {
        window.clearTimeout(releaseTimerRef.current);
      }
      const unlockWhenInputIsQuiet = () => {
        const elapsed = performance.now() - lastInputAtRef.current;
        if (elapsed < INPUT_QUIET_MS) {
          releaseTimerRef.current = window.setTimeout(
            unlockWhenInputIsQuiet,
            INPUT_QUIET_MS - elapsed,
          );
          return;
        }
        isAnimatingRef.current = false;
        wheelDeltaRef.current = 0;
        touchTriggeredRef.current = false;
        releaseTimerRef.current = null;
      };
      releaseTimerRef.current = window.setTimeout(
        unlockWhenInputIsQuiet,
        RELEASE_DELAY_MS,
      );
    };

    const go = (direction: 1 | -1) => {
      if (isAnimatingRef.current) return;
      const target = findTarget(direction);
      if (!target) return;
      isAnimatingRef.current = true;
      wheelDeltaRef.current = 0;
      touchTriggeredRef.current = true;
      scrollToTarget(target, { onComplete: release });
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || isEditableEventTarget(event.target)) return;
      event.preventDefault();
      lastInputAtRef.current = performance.now();
      if (isAnimatingRef.current) return;

      wheelDeltaRef.current += normalizeWheelDelta(event);
      if (Math.abs(wheelDeltaRef.current) < WHEEL_DELTA_THRESHOLD) return;

      go(wheelDeltaRef.current > 0 ? 1 : -1);
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || isEditableEventTarget(event.target)) return;
      lastInputAtRef.current = performance.now();
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      touchTriggeredRef.current = false;
    };

    const onTouchMove = (event: TouchEvent) => {
      const start = touchStartRef.current;
      const touch = event.touches[0];
      if (!start || !touch || isEditableEventTarget(event.target)) return;

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dy) <= Math.abs(dx)) {
        return;
      }

      event.preventDefault();
      lastInputAtRef.current = performance.now();
      if (Math.abs(dy) < TOUCH_DELTA_THRESHOLD) {
        return;
      }
      if (touchTriggeredRef.current || isAnimatingRef.current) return;
      go(dy < 0 ? 1 : -1);
    };

    const onTouchEnd = () => {
      touchStartRef.current = null;
      touchTriggeredRef.current = false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableEventTarget(event.target)) return;
      lastInputAtRef.current = performance.now();

      let direction: 1 | -1 | null = null;
      if (
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        (event.key === " " && !event.shiftKey)
      ) {
        direction = 1;
      } else if (
        event.key === "ArrowUp" ||
        event.key === "PageUp" ||
        (event.key === " " && event.shiftKey)
      ) {
        direction = -1;
      }

      if (event.key === "Home") {
        event.preventDefault();
        const target = getNarrativeSnapTargets()[0];
        if (!target || isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        scrollToTarget(target, { onComplete: release });
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        const targets = getNarrativeSnapTargets();
        const target = targets[targets.length - 1];
        if (!target || isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        scrollToTarget(target, { onComplete: release });
        return;
      }

      if (direction == null) return;
      event.preventDefault();
      go(direction);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      if (releaseTimerRef.current != null) {
        window.clearTimeout(releaseTimerRef.current);
      }
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled, scrollToTarget]);
}
