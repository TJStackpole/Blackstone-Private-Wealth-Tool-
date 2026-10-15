/** Small color helpers so map shading can be computed without a library. */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

/** Linear blend from `from` (t = 0) to `to` (t = 1). */
export function mix(from: string, to: string, t: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const k = Math.min(1, Math.max(0, t));
  return rgbToHex([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]);
}

/**
 * Map a state's weight to a shade between the "no holdings" color and the layer color.
 * Uses a square root so small states still get a visible tint.
 */
export function shadeFor(weight: number, max: number, empty: string, accent: string): string {
  if (!weight || max <= 0) return empty;
  const t = 0.18 + 0.82 * Math.sqrt(weight / max);
  return mix(empty, accent, t);
}
