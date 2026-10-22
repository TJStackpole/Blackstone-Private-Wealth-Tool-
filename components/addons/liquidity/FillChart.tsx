import type { FundCode } from "@/config/addons";
import { HISTORY, type CapEvent } from "@/lib/addons/liquidity/data";
import { FUNDS } from "@/lib/addons/shared/funds";
import { formatMonth } from "@/lib/dates";

const parts = (iso: string) => {
  const [month, year] = formatMonth(iso).split(" ");
  return { month, year: `'${year.slice(2)}` };
};
const label = (iso: string) => `${parts(iso).month} ${parts(iso).year}`;

/** Each time the limits applied, the share of requests that was filled, as bars grouped by fund. */
export default function FillChart() {
  const events = HISTORY.events.filter((e): e is CapEvent & { filledPct: number } => typeof e.filledPct === "number");
  const funds = [...new Set(events.map((e) => e.fund))] as FundCode[];
  return (
    <figure className="space-y-4 rounded-card border border-line bg-bg-raised p-4 sm:p-6">
      <div className="flex gap-4 sm:gap-8">
        {funds.map((f) => {
          const list = events.filter((e) => e.fund === f);
          return (
            <div
              key={f}
              className="min-w-0"
              style={{ flex: list.length, ["--c" as string]: FUNDS[f].color, ["--cd" as string]: FUNDS[f].colorDark }}
            >
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--c)] dark:bg-[var(--cd)]" />
                {FUNDS[f].label}
              </p>
              <ol className="flex gap-1.5 sm:gap-3" aria-label={`${FUNDS[f].label}: share of requests filled`}>
                {list.map((e) => (
                  <li key={e.date} className="flex min-w-0 flex-1 flex-col items-center">
                    <span className="sr-only">
                      {label(e.date)}: {e.filledApprox ? "about " : ""}
                      {e.filledPct}% of requests filled
                    </span>
                    <div aria-hidden className="w-full pt-6">
                    <div className="relative flex h-36 w-full items-end justify-center border-b border-line sm:h-44">
                      <span
                        className="w-full max-w-[40px] rounded-t-[3px] bg-[var(--c)] dark:bg-[var(--cd)]"
                        style={{ height: `${e.filledPct}%`, minHeight: 2 }}
                      />
                      <span
                        className="tnum absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-ink sm:text-xs"
                        style={{ bottom: `calc(${e.filledPct}% + 4px)` }}
                      >
                        {e.filledApprox ? "≈" : ""}
                        {e.filledPct}%
                      </span>
                    </div>
                    </div>
                    <span aria-hidden className="tnum mt-1.5 flex flex-col items-center text-[10px] leading-tight text-muted sm:flex-row sm:gap-1 sm:text-[11px]">
                      <span>{parts(e.date).month}</span>
                      <span>{parts(e.date).year}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
      <figcaption className="text-xs leading-relaxed text-muted">
        Share of requests filled each time the limits applied. ≈ worked out from the amounts the filing gives. From the funds&apos; own SEC filings.
      </figcaption>
    </figure>
  );
}
