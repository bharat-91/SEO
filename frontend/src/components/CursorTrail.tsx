import { useEffect, useRef, useState } from 'react';

const SPARKS = 8;
const LEAD_EASE = 0.35;
const TAIL_EASE = 0.24;

/**
 * Decorative gold "treasure spark" cursor trail plus a soft spotlight that
 * lifts the surface under the pointer.
 *
 * Guards: skipped entirely on touch/coarse pointers and when the user prefers
 * reduced motion. The layer is aria-hidden with pointer-events:none, so it can
 * never intercept input or be announced by assistive tech.
 */
export function CursorTrail() {
  const [enabled, setEnabled] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const sparkRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const mouse = useRef({ x: -200, y: -200 });
  const trail = useRef(
    Array.from({ length: SPARKS }, () => ({ x: -200, y: -200 }))
  );
  const seen = useRef(false);

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(!coarse && !reduced);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    function onMove(event: MouseEvent) {
      mouse.current.x = event.clientX;
      mouse.current.y = event.clientY;

      if (!seen.current) {
        seen.current = true;
        // Snap the trail to the first known position so it doesn't fly in
        // from the corner on the very first movement.
        trail.current.forEach((p) => {
          p.x = event.clientX;
          p.y = event.clientY;
        });
        if (layerRef.current) layerRef.current.style.opacity = '1';
      }
    }

    function onLeave() {
      if (layerRef.current) layerRef.current.style.opacity = '0';
    }

    function onEnter() {
      if (seen.current && layerRef.current) layerRef.current.style.opacity = '1';
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    let raf = 0;
    const render = () => {
      let tx = mouse.current.x;
      let ty = mouse.current.y;

      trail.current.forEach((point, i) => {
        const ease = i === 0 ? LEAD_EASE : TAIL_EASE;
        point.x += (tx - point.x) * ease;
        point.y += (ty - point.y) * ease;
        tx = point.x;
        ty = point.y;

        const node = sparkRefs.current[i];
        if (node) {
          const scale = 1 - i / (SPARKS + 2);
          node.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        }
      });

      const head = trail.current[0];
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${head.x}px, ${head.y}px, 0) translate(-50%, -50%)`;
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={layerRef} aria-hidden="true" style={styles.layer}>
      <div ref={glowRef} style={styles.glow} />
      {Array.from({ length: SPARKS }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            sparkRefs.current[i] = el;
          }}
          style={{
            ...styles.spark,
            width: `${11 - i}px`,
            height: `${11 - i}px`,
            opacity: 0.9 - i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

const styles = {
  layer: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 9999,
    pointerEvents: 'none' as const,
    opacity: 0,
    transition: 'opacity 220ms ease',
  },
  glow: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(245,183,0,0.10) 0%, rgba(34,211,238,0.05) 40%, transparent 68%)',
    willChange: 'transform',
  },
  spark: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    borderRadius: '50%',
    background:
      'radial-gradient(circle at 35% 35%, #fff6d6 0%, #f5b700 45%, rgba(245,183,0,0) 72%)',
    boxShadow: '0 0 10px rgba(245,183,0,0.55)',
    willChange: 'transform',
  },
};
