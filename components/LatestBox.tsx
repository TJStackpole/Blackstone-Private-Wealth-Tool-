"use client";

import { useId } from "react";
import type { LatestUpdate } from "@/lib/latest";
import type { Source } from "@/lib/types";
import { formatDate } from "@/lib/dates";
import { ChangeChip, SourceLinks } from "./QuarterBox";
import NextUpdate from "./NextUpdate";
import { nextUpdate } from "@/lib/schedule";

/**
 * The fund's newest month-end figures, from the filings between 10-Qs: value per share, size, the latest declared
 * distribution. Sits above the quarter's box, dated on its own, so the two dates never blur together.
 */
export default function LatestBox({ latest, quarterAsOf }: { latest: LatestUpdate; quarterAsOf: string }) {
  const id = useId();
  const nextQ = nextUpdate(quarterAsOf);
  const odd = latest.items.length % 2 === 1;
  const sources = [...latest.items.flatMap((i) => i.sources), ...latest.notes.flatMap((n) => n.sources)].filter(
    (s: Source, i, all) => all.findIndex((o) => o.url === s.url) === i,
  );
  return (
    <section aria-labelledby={id} className="overflow-hidden rounded-card border border-accent/40 bg-bg-raised" data-latest-box>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-line px-4 py-2.5">
        <h3 id={id} className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink">
          Latest monthly update
        </h3>
        <span className="tnum text-[11px] text-muted">
          Values at {formatDate(latest.asOf)} · filed {formatDate(latest.filed)}
        </span>
      </div>
      <dl className="grid grid-cols-2">
        {latest.items.map((m, i) => (
          <div
            key={m.label}
            className={[
              "flex flex-col gap-1 p-3.5 sm:p-4",
              i % 2 === 1 ? "border-l border-line" : "",
              i > 1 ? "border-t border-line" : "",
              odd && i === latest.items.length - 1 ? "col-span-2" : "",
            ].join(" ")}
            data-latest={m.label}
          >
            <dt className="text-[11px] uppercase tracking-[0.08em] text-muted">{m.label}</dt>
            <dd className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="tnum font-serif text-[22px] leading-none text-ink">{m.value}</span>
              {m.change && m.direction && <ChangeChip change={m.change} direction={m.direction} />}
            </dd>
            <dd className="tnum text-xs leading-snug text-muted">{m.from}</dd>
            {m.note && <dd className="text-[11px] leading-snug text-muted">{m.note}</dd>}
          </div>
        ))}
      </dl>
      {latest.notes.length > 0 && (
        <ul className="space-y-1 border-t border-line px-4 py-2.5 text-xs leading-snug text-muted-strong">
          {latest.notes.map((n) => (
            <li key={n.text}>{n.text}</li>
          ))}
        </ul>
      )}
      <p className="border-t border-line px-4 py-2 text-[11px] text-muted">
        Source: <SourceLinks sources={sources} /> · <NextUpdate asOf={latest.asOf} cadence="monthly" />. The map, sector mix and holdings are from the
        10-Q for the quarter ended {formatDate(quarterAsOf)}{nextQ ? `; the next is expected in ${nextQ.month}` : ""}.
      </p>
    </section>
  );
}
