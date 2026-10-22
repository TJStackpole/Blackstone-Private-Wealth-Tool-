import type { AddonSource } from "@/lib/addons/shared/types";
import { formatDate } from "@/lib/dates";
import { cadenceOf } from "@/lib/schedule";
import NextUpdate from "@/components/NextUpdate";

const base = "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]";

/** Placeholder data that isn't from a filing yet (Rule 8). */
export function SampleBadge() {
  return (
    <span className={`${base} border-sample-border bg-sample-bg text-sample`} title="Placeholder figures, not from a filing">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sample" />
      Sample data
    </span>
  );
}

/** Every calculator output (Rule 8). */
export function IllustrativeBadge() {
  return (
    <span className={`${base} border-line bg-bg text-muted-strong`} title="An illustration built from the inputs shown, not a forecast">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
      Illustrative
    </span>
  );
}

/** "As of … · Source: …" line for any dataset or parameter. */
export function AsOfSource({ asOf, source }: { asOf: string; source: AddonSource }) {
  const cadence = cadenceOf(source.name);
  return (
    <p className="text-xs leading-relaxed text-muted">
      <span className="tnum">As of {formatDate(asOf)}</span> · Source:{" "}
      <a href={source.url} target="_blank" rel="noreferrer noopener" className="underline decoration-line underline-offset-2 hover:text-ink">
        {source.name}
      </a>
      {source.page ? `, ${source.page}` : ""}
      {cadence && (
        <>
          {" · "}
          <NextUpdate asOf={asOf} cadence={cadence} />
        </>
      )}
    </p>
  );
}
