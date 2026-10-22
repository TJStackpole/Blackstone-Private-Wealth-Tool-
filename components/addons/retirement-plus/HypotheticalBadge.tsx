/** Beside the Illustrative badge on every Outcome Lab result (BUILD_PLAN_401K.md, Rule C). */
export default function HypotheticalBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-bg px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-strong"
      title="A made-up worker, not a real person, fund or plan"
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full border border-muted" />
      Hypothetical
    </span>
  );
}
