import type { RegEntry } from "@/lib/addons/retirement-plus/data";
import { formatDate } from "@/lib/dates";

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
        <ol className="divide-y divide-line rounded-card border border-line bg-bg-raised">
          {sorted.map((e) => (
            <li key={`${e.date}-${e.title}`} className="grid gap-x-6 gap-y-0.5 px-4 py-3 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-baseline sm:px-5">
              <p className="tnum text-xs font-medium text-muted">{formatDate(e.date)}</p>
              <p className="text-sm font-medium text-ink" title={e.summary}>
                {e.title}
              </p>
              <a
                href={e.source.url}
                target="_blank"
                rel="noreferrer noopener"
                title={e.summary}
                className="text-xs text-muted underline decoration-line underline-offset-2 hover:text-ink"
              >
                {e.source.name.split(",")[0]}
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
