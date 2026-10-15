import { formatPct } from "@/lib/aggregate";

interface Props {
  maxPct: number;
  accent: string;
  label: string;
}

/** Shading scale under the map: light = none, dark = the heaviest state. */
export default function Legend({ maxPct, accent, label }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-muted">
      <div className="flex items-center gap-2">
        <span>Share of {label}</span>
        <span className="tnum">0%</span>
        <span
          aria-hidden
          className="h-2 w-28 rounded-full border border-line"
          style={{ background: `linear-gradient(90deg, var(--map-empty), ${accent})` }}
        />
        <span className="tnum">{formatPct(maxPct)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span>Metro</span>
        <span aria-hidden className="flex items-end gap-1">
          <span className="h-1.5 w-1.5 rounded-full border" style={{ borderColor: accent }} />
          <span className="h-3 w-3 rounded-full border" style={{ borderColor: accent }} />
        </span>
        <span>sized by weight</span>
      </div>
    </div>
  );
}
