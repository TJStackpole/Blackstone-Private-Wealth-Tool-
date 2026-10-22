import type { RegEntry } from "@/lib/addons/retirement-plus/data";
import { formatDate } from "@/lib/aggregate";
import Sources from "./Sources";

/** Dated public milestones, each from a linked source. Nothing here is written without one. */
export default function Timeline({ entries, checked }: { entries: RegEntry[]; checked: string }) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <section aria-labelledby="rp-time-h" className="space-y-4">
      <div>
        <h2 id="rp-time-h" className="font-serif text-[24px] font-medium leading-tight text-ink">
          Rules and rulings so far
        </h2>
        <p className="mt-1 text-sm text-muted-strong">
          Public milestones, oldest first. <span className="tnum">Last checked {formatDate(checked)}.</span>
        </p>
      </div>
      {sorted.length === 0 ? (
        <p role="status" className="rounded-card border border-dashed border-line p-4 text-sm text-muted-strong">
          No entries yet. Entries are added only from sourced documents.
        </p>
      ) : (
        <ol className="relative space-y-5 border-l border-line pl-6">
          {sorted.map((e) => (
            <li key={`${e.date}-${e.title}`} className="relative">
              <span aria-hidden className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-accent" />
              <p className="tnum text-xs font-medium text-muted">{formatDate(e.date)}</p>
              <p className="mt-0.5 text-sm font-medium text-ink">{e.title}</p>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-strong">{e.summary}</p>
              <Sources sources={[e.source]} className="mt-1 block" />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
