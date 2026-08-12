import { useEffect, useRef, useState } from 'react';

const DURATION_MS = 850;

/**
 * Animates a number from 0 to `target` on mount / when the target changes.
 * Returns the target immediately when the user prefers reduced motion, so
 * the value is never withheld from anyone — the animation is decoration only.
 */
export function useCountUp(target: number): number {
  const [value, setValue] = useState(target);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      // easeOutExpo — fast start, gentle settle
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(from + (target - from) * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target]);

  return value;
}
