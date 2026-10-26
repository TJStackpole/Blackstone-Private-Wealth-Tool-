"use client";

import { useId } from "react";
import type { FundData, QuarterMove, Source } from "@/lib/types";
import { formatDate } from "@/lib/dates";
import NextUpdate from "./NextUpdate";

function Arrow({ direction }: { direction: QuarterMove["direction"] }) {
  if (direction === "flat") return <span aria-hidden>→</span>;
  return (
    <svg aria-hidden width="10" height="10" viewBox="0 0 10 10" className={direction === "down" ? "rotate-180" : undefined}>
      <path d="M5 1.5 9 7.5H1z" fill="currentColor" />
    </svg>
  );
}

/** "▲ +2.8%": which way a figure moved. Direction only: no good or bad colors. A status ("all filled") has no arrow. */
export function ChangeChip({ change, direction }: { change: string; direction: QuarterMove["direction"] }) {
  if (!change) return null;
  return (
    <span className="tnum inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-line bg-bg px-1.5 py-0.5 text-[11px] font-medium text-ink">
      {direction !== "none" && (
        <>
          <Arrow direction={direction} />
          <span className="sr-only">{direction === "up" ? "Up" : direction === "down" ? "Down" : "Unchanged"}:</span>
        </>
      )}
      {change}
    </span>
  );
}

/** Source links, separated by " · ", the full name and section on hover. */
export function SourceLinks({ sources }: { sources: Source[] }) {
  return (
    <>
      {sources.map((s, i) => (
        <span key={`${s.url}-${i}`}>
          {i > 0 && " · "}
          <a
            href={s.url}
            target="_blank"
            rel="noreferrer noopener"
            title={s.page ? `${s.name}, ${s.page}` : s.name}
            className="underline decoration-line underline-offset-2 hover:text-ink"
          >
            {s.name}
          </a>
        </span>
      ))}
    </>
  );
}

/**
 * The last quarterly report (10-Q) in four to six numbers, each with which way it moved and what it's compared with.
 * Pass it quarterFigures(), which folds in the stat cards so each figure shows once.
 */
export default function QuarterBox({ q }: { q: NonNullable<FundData["quarterSummary"]> }) {
  const id = useId();
  const odd = q.items.length % 2 === 1;
  return (
    <section aria-labelledby={id} className="overflow-hidden rounded-card border border-line bg-bg-raised" data-quarter-box>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-line px-4 py-2.5">
        <h3 id={id} className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink">
          Last quarterly report
        </h3>
        <span className="tnum text-[11px] text-muted">{q.period}</span>
      </div>
      <dl className="grid grid-cols-2">
        {q.items.map((m, i) => (
          <div
            key={m.label}
            className={[
              "flex flex-col gap-1 p-3.5 sm:p-4",
              i % 2 === 1 ? "border-l border-line" : "",
              i > 1 ? "border-t border-line" : "",
              odd && i === q.items.length - 1 ? "col-span-2" : "",
            ].join(" ")}
            data-quarter={m.label}
          >
            <dt className="text-[11px] uppercase tracking-[0.08em] text-muted" title={m.note}>
              {m.label}
            </dt>
            <dd className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="tnum font-serif text-[22px] leading-none text-ink">{m.value}</span>
              <ChangeChip change={m.change} direction={m.direction} />
            </dd>
            <dd className="tnum text-xs leading-snug text-muted">{m.from}</dd>
            {m.note && <dd className="text-[11px] leading-snug text-muted">{m.note}</dd>}
          </div>
        ))}
      </dl>
      <p className="border-t border-line px-4 py-2 text-[11px] text-muted">
        <span className="tnum">As of {formatDate(q.asOf)}</span> · Source: <SourceLinks sources={[q.source, ...(q.moreSources ?? [])]} />
        {" · "}
        <NextUpdate asOf={q.asOf} />
      </p>
    </section>
  );
}
