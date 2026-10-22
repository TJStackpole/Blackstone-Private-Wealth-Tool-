import type { FundData } from "@/lib/types";

/** The fund's headline stat cards. In the side panel on desktop; above the map on phones, where the panel is a sheet. */
export default function FundStats({ data }: { data: FundData }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-y border-line py-4">
      {data.summary.stats.map((s) => (
        <div key={s.label}>
          <dt className="text-[11px] uppercase tracking-[0.08em] text-muted">{s.label}</dt>
          <dd className="tnum font-serif text-2xl text-ink">{s.value}</dd>
          {s.note && <dd className="text-xs leading-snug text-muted">{s.note}</dd>}
        </div>
      ))}
    </dl>
  );
}
