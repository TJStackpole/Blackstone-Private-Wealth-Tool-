/** Shown whenever any visible entry is placeholder data rather than a filing. */
export default function SampleBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className="inline-flex shrink-0 items-center whitespace-nowrap gap-1.5 rounded-full border border-sample-border bg-sample-bg px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-sample"
      title="These figures are placeholders. No real holdings have been loaded yet."
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sample" />
      {compact ? "Sample" : "Sample data"}
    </span>
  );
}
