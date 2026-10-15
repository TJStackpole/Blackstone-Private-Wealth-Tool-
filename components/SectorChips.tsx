"use client";

interface Props {
  sectors: string[];
  /** Display names, when they differ from the keys. */
  labels?: Record<string, string>;
  active: string | null;
  onChange: (sector: string | null) => void;
  /** Percent of the fund in each sector, for the small number on each chip. */
  mix?: Record<string, number>;
}

/** Filter chips. One sector at a time; "All sectors" clears the filter. */
export default function SectorChips({ sectors, labels, active, onChange, mix }: Props) {
  const chips: { key: string | null; label: string }[] = [
    { key: null, label: "All sectors" },
    ...sectors.map((s) => ({ key: s, label: labels?.[s] ?? s })),
  ];
  return (
    <div role="group" aria-label="Filter by sector" className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      {chips.map(({ key, label }) => {
        const selected = active === key;
        const pct = key ? mix?.[key] : undefined;
        return (
          <button
            key={label}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(key)}
            className={[
              "flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
              selected
                ? "border-accent bg-accent text-accent-contrast"
                : "border-line bg-bg-raised text-muted-strong hover:border-muted hover:text-ink",
            ].join(" ")}
          >
            {label}
            {pct !== undefined && pct > 0 && (
              <span className={["tnum", selected ? "opacity-80" : "text-muted"].join(" ")}>{Number.isInteger(pct) ? pct : pct.toFixed(1)}%</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
