import { HISTORY } from "@/lib/addons/liquidity/data";
import { FUNDS } from "@/lib/addons/shared/funds";
import { formatDate } from "@/lib/aggregate";
import type { FundCode } from "@/config/addons";

/** Past limit events, oldest first, each linked to the filing that reports it. */
export default function HistoryTimeline({ fund }: { fund?: FundCode }) {
  const events = fund ? HISTORY.events.filter((e) => e.fund === fund) : HISTORY.events;
  if (events.length === 0) return <p className="text-sm text-muted">No limit events are recorded here for this fund.</p>;
  return (
    <ol className="space-y-5 border-l border-line pl-5">
      {events.map((e) => (
        <li key={`${e.fund}-${e.date}`} className="relative">
          <span aria-hidden className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full ring-4 ring-bg" style={{ background: FUNDS[e.fund].color }} />
          <p className="tnum text-[11px] uppercase tracking-[0.08em] text-muted">
            {FUNDS[e.fund].label} · {formatDate(e.date)}
          </p>
          <h4 className="mt-0.5 text-sm font-medium text-ink">{e.title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-muted-strong">{e.detail}</p>
          <a href={e.source.url} target="_blank" rel="noreferrer noopener" className="mt-1 inline-block text-xs text-muted underline decoration-line underline-offset-2 hover:text-ink">
            Source: {e.source.name}
          </a>
        </li>
      ))}
    </ol>
  );
}
