import { useEffect, useRef, useState } from 'react';

const TRAIL_LENGTH = 6;
const EASE = 0.28;

/**
 * Decorative "treasure spark" trail that follows the cursor.
 * Disabled for touch devices and prefers-reduced-motion — it's pure flair,
 * never load-bearing for any interaction, and pointer-events: none so it
 * can never intercept a click.
 */
export function CursorTrail() {
  const [enabled, setEnabled] = useState(false);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const positions = useRef(
    Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 }))
  );
  const mouse = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    setEnabled(!reducedMotion && finePointer);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    function handleMouseMove(e: MouseEvent) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    }
    window.addEventListener('mousemove', handleMouseMove);

    let rafId: number;
    function animate() {
      let targetX = mouse.current.x;
      let targetY = mouse.current.y;

      positions.current.forEach((pos, i) => {
        pos.x += (targetX - pos.x) * EASE;
        pos.y += (targetY - pos.y) * EASE;
        targetX = pos.x;
        targetY = pos.y;

        const dot = dotsRef.current[i];
        if (dot) {
          dot.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        }
      });

      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" style={styles.container}>
      {Array.from({ length: TRAIL_LENGTH }).map((_, i) => {
        const size = 16 - i * 2;
        return (
          <div
            key={i}
            ref={(el) => {
              dotsRef.current[i] = el;
            }}
            style={{
              ...styles.dot,
              width: `${size}px`,
              height: `${size}px`,
              opacity: 1 - i * 0.14,
            }}
          />
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed' as const,
    inset: 0,
    pointerEvents: 'none' as const,
    zIndex: 9999,
  },
  dot: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(245,183,0,0.85) 0%, rgba(245,183,0,0) 70%)',
    transform: 'translate(-100px, -100px)',
    willChange: 'transform',
  },
};
