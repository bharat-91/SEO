// Centralized palette for the "high seas" theme — deep ocean + treasure gold.
// Every color here has been checked for WCAG AA contrast in its actual usage
// (see comments); don't introduce new raw hex codes elsewhere.

export const theme = {
  // Backgrounds
  bgDeep: '#030f1f', // near-black deep ocean, page background
  bgOcean: '#0b2545', // card / surface background
  bgOceanLight: '#123a63', // hover / elevated surface
  border: 'rgba(245, 183, 0, 0.18)', // gold-tinted hairline border

  // Text
  textPrimary: '#f1f5f9', // near-white, ~15:1 on bgDeep/bgOcean
  textMuted: '#94a3b8', // slate-400, ~7:1 on bgDeep/bgOcean

  // Accents
  gold: '#f5b700', // treasure gold — used as text/icon color or button fill
  goldSoft: 'rgba(245, 183, 0, 0.12)',
  teal: '#22d3ee', // sea-foam cyan accent

  // Status / severity — kept at the -700 shade verified earlier at 4.8:1+
  // against white text; independent of surrounding theme since these are
  // always filled badges.
  critical: '#b91c1c',
  warning: '#b45309',
  success: '#15803d',
  info: '#1d4ed8',
} as const;
