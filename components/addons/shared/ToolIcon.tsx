import type { AddonId } from "@/config/addons";

/** A simple line picture for each tool, drawn in the current text color. Decorative: the tool's name is always next to it. */
const PATHS: Record<AddonId | "retirement-plus", React.ReactNode> = {
  // Bars under a dashed line: payouts up to a limit.
  liquidity: (
    <>
      <path d="M5 20v-7M10 20V9M15 20v-5M20 20V7" strokeWidth={2.4} />
      <path d="M3 11h19" strokeDasharray="2 2.5" />
    </>
  ),
  // A bridge from the index to the fund.
  "index-vs-fund": (
    <>
      <path d="M2 17h20" />
      <path d="M4 17v-2.5a8 8 0 0 1 16 0V17" />
      <path d="M8.5 17v-4.5M12 17v-6M15.5 17v-4.5" />
    </>
  ),
  // A magnifier over a percent sign.
  "tax-lens": (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
      <path d="M8 13l5-5" />
      <circle cx="8.3" cy="8.3" r="0.9" />
      <circle cx="12.7" cy="12.7" r="0.9" />
    </>
  ),
  // A jagged traded line and a smooth appraised one.
  smoothing: (
    <>
      <path d="M2 14l3-6 3 9 3-11 3 9 3-5 4 4" strokeOpacity={0.45} />
      <path d="M2 13c4-2.5 7-2.5 10 0s6 2.5 10 0" strokeWidth={2} />
    </>
  ),
  // Three overlapping circles: one theme across funds.
  themes: (
    <>
      <circle cx="9" cy="9.5" r="5" />
      <circle cx="15" cy="9.5" r="5" />
      <circle cx="12" cy="14.5" r="5" />
    </>
  ),
  // Steps (money called over time) next to a full block (all in on day one).
  "drawdown-vs-evergreen": (
    <>
      <path d="M2 20h3v-4h3v-4h3V8" />
      <rect x="14" y="6" width="7" height="14" rx="1" />
    </>
  ),
  // A clipboard with a check.
  "reality-check": (
    <>
      <rect x="5" y="4.5" width="14" height="16.5" rx="2" />
      <path d="M9 4.5V3h6v1.5" />
      <path d="M8.5 13l2.5 2.5 4.5-5" />
    </>
  ),
  // A nest egg on a rising line.
  "retirement-plus": (
    <>
      <path d="M3 19c3-1 5-4 8-6s6-3 10-7" />
      <ellipse cx="17" cy="16" rx="3.5" ry="4.2" />
    </>
  ),
};

export default function ToolIcon({ id, size = 24, className = "" }: { id: AddonId | "retirement-plus"; size?: number; className?: string }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {PATHS[id]}
    </svg>
  );
}
