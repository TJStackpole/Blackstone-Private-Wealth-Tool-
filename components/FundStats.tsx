import type { FundData } from "@/lib/types";
import { ChangeChip, SourceLinks } from "./QuarterBox";

/**
 * The fund's headline stat cards, each with how it moved since the prior report and what it's compared with.
 * In the side panel on desktop; above the map on phones, where the panel is a sheet.
 */
export default function FundStats({ data }: { data: FundData }) {
  const sources = data.summary.stats
    .flatMap((s) => s.sources ?? [])
    .filter((s, i, all) => all.findIndex((o) => o.url === s.url) === i);
  return (
    <div className="border-y border-line py-4">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
        {data.summary.stats.map((s) => (
          <div key={s.label} data-stat={s.label}>
            <dt className="text-[11px] uppercase tracking-[0.08em] text-muted">{s.label}</dt>
            <dd className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="tnum font-serif text-2xl text-ink">{s.value}</span>
              {s.change && s.direction && <ChangeChip change={s.change} direction={s.direction} />}
            </dd>
            {s.from && <dd className="tnum text-xs leading-snug text-muted">{s.from}</dd>}
            {s.note && <dd className="mt-0.5 text-[11px] leading-snug text-muted">{s.note}</dd>}
          </div>
        ))}
      </dl>
      {sources.length > 0 && (
        <p className="mt-3 text-[11px] leading-snug text-muted">
          Sources: <SourceLinks sources={sources} />
        </p>
      )}
    </div>
  );
}
