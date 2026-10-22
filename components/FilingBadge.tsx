import type { FundData } from "@/lib/types";
import { formatDate } from "@/lib/dates";

/** Marks data that comes from an SEC filing, and which one. */
export default function FilingBadge({ data }: { data: FundData }) {
  return (
    <a
      href={data.filing.url}
      target="_blank"
      rel="noreferrer noopener"
      title={`${data.filing.entity}, Form ${data.filing.form}, filed ${formatDate(data.filing.filed)}`}
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-bg px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-strong hover:text-ink"
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
      SEC {data.filing.form} · {formatDate(data.asOf)}
    </a>
  );
}
