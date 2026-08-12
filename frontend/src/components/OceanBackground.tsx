import { useMemo } from 'react';

/** Deterministic pseudo-random so bubbles don't reshuffle on every render. */
function seeded(index: number, salt: number): number {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const BUBBLE_COUNT = 18;

function WaveBand({
  fill,
  opacity,
  duration,
  height,
  bottom,
}: {
  fill: string;
  opacity: number;
  duration: number;
  height: number;
  bottom: number;
}) {
  // Two identical periods side by side so translateX(-50%) loops seamlessly.
  const path =
    'M0,30 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,120 L0,120 Z';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="${path}" fill="${fill}"/></svg>`;

  return (
    <div
      className="wave"
      style={{
        height: `${height}px`,
        bottom: `${bottom}px`,
        top: 'auto',
        opacity,
        animationDuration: `${duration}s`,
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
      }}
    />
  );
}

/**
 * Purely decorative backdrop: depth gradient, light shafts, rising bubbles
 * and parallax wave bands. Every layer is aria-hidden and pointer-events:none,
 * and all motion is disabled under prefers-reduced-motion (see layout.css).
 */
export function OceanBackground() {
  const bubbles = useMemo(
    () =>
      Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
        left: seeded(i, 1) * 100,
        size: 5 + seeded(i, 2) * 16,
        duration: 14 + seeded(i, 3) * 18,
        delay: seeded(i, 4) * 18,
        drift: (seeded(i, 5) - 0.5) * 120,
      })),
    []
  );

  return (
    <div aria-hidden="true">
      <div className="bg-depth" />
      <div className="bg-rays" />

      <div className="bg-bubbles">
        {bubbles.map((b, i) => (
          <span
            key={i}
            className="bubble"
            style={{
              left: `${b.left}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              animationDuration: `${b.duration}s`,
              animationDelay: `-${b.delay}s`,
              ['--drift' as string]: `${b.drift}px`,
            }}
          />
        ))}
      </div>

      <div className="bg-waves">
        <WaveBand fill="rgba(34,211,238,0.10)" opacity={1} duration={22} height={70} bottom={16} />
        <WaveBand fill="rgba(245,183,0,0.07)" opacity={1} duration={15} height={58} bottom={4} />
        <WaveBand fill="rgba(11,37,69,0.55)" opacity={1} duration={30} height={80} bottom={0} />
      </div>

      <div className="bg-vignette" />
    </div>
  );
}
