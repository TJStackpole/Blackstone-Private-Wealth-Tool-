import { AsOfSource, SampleBadge } from "@/components/addons/shared/Badges";
import type { IndexVsFund, ShareClass } from "@/lib/addons/index-vs-fund/data";
import { SHARE_CLASSES, returnFor } from "@/lib/addons/index-vs-fund/data";
import { FUNDS } from "@/lib/addons/shared/funds";

/** At least one decimal, as the filings print them (5.0%, 13.69%), with a true minus sign. */
export const pct = (v: number) => `${v < 0 ? "−" : ""}${Math.abs(v).toFixed(Math.max(1, String(v).split(".")[1]?.length ?? 0))}%`;

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-line px-2 py-0.5 text-[11px] text-muted-strong">{children}</span>;
}

/** Index on the left, the fund by share class on the right. Every number shows its period and source. */
export default function ComparisonCard({ data, highlight, compact = false }: { data: IndexVsFund; highlight?: ShareClass; compact?: boolean }) {
  const { index, fundSide, fees } = data;
  const first = fundSide.returns[0];
  return (
    <div className={compact ? "grid gap-3" : "grid gap-4 md:grid-cols-2"}>
      <section aria-label="Index" className="flex flex-col gap-3 rounded-card border border-line bg-bg-raised p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">Index</p>
          {index.sample && <SampleBadge />}
        </div>
        <div>
          <h3 className="font-serif text-lg leading-snug text-ink">{index.name}</h3>
          {!compact && <p className="mt-1 text-sm leading-relaxed text-muted-strong print:hidden">{index.measures}</p>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Tag>{index.feeBasis === "gross" ? "Before fees" : "After fees"}</Tag>
          <Tag>{index.levered ? "Includes borrowing" : "No borrowing"}</Tag>
        </div>
        {index.return ? (
          <div>
            <p className="tnum font-serif text-[32px] leading-none text-ink">{pct(index.return.value)}</p>
            <p className="mt-1 text-xs text-muted-strong">{index.return.period}</p>
            {index.return.note && !compact && <p className="mt-1 text-xs text-muted">{index.return.note}</p>}
          </div>
        ) : (
          <p className="text-sm text-muted-strong">No figure shown: these indices are licensed rather than published free.</p>
        )}
        {!compact && (
          <ul className="space-y-1 text-xs leading-relaxed text-muted-strong print:hidden">
            <li>{index.feeText}</li>
            <li>{index.leverageText}</li>
          </ul>
        )}
        <div className="mt-auto space-y-1">
          <AsOfSource asOf={index.asOf} source={index.source} />
          {index.verify && <p className="text-[11px] text-muted">{index.verify}</p>}
        </div>
      </section>

      <section aria-label="Fund by share class" className="flex flex-col gap-3 rounded-card border border-line bg-bg-raised p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">Fund, by share class</p>
          {fundSide.sample && <SampleBadge />}
        </div>
        <div>
          <h3 className="font-serif text-lg leading-snug text-ink">{FUNDS[data.fund].label}</h3>
          {!compact && <p className="mt-1 text-sm leading-relaxed text-muted-strong">{fundSide.label}, after the fund&apos;s fees and with its borrowing.</p>}
        </div>
        <table className="tnum w-full text-sm">
          <caption className="sr-only">{fundSide.label}</caption>
          <thead className="text-[11px] uppercase tracking-[0.08em] text-muted">
            <tr>
              <th scope="col" className="py-1 text-left font-medium">Class</th>
              <th scope="col" className="py-1 text-right font-medium">Servicing fee</th>
              <th scope="col" className="py-1 text-right font-medium">Return</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {SHARE_CLASSES.map((c) => {
              const r = returnFor(data, c);
              return (
                <tr key={c} className={highlight === c ? "bg-bg font-medium" : undefined} aria-current={highlight === c ? "true" : undefined}>
                  <th scope="row" className="py-1.5 text-left font-normal text-ink">
                    Class {c}
                  </th>
                  <td className="py-1.5 text-right text-muted-strong">{fees.servicing[c]}% a year</td>
                  <td className="py-1.5 text-right font-serif text-lg text-ink">{r ? pct(r.value) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-xs text-muted-strong">{first.period}</p>
        <div className="mt-auto">
          <AsOfSource asOf={first.asOf} source={first.source} />
        </div>
      </section>
    </div>
  );
}
