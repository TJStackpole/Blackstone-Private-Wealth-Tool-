import type { FundData } from "@/lib/types";
import { formatMoneyMillions, formatPct } from "@/lib/aggregate";

/** Credit funds: the borrowers are the story, so they take the map's place. Holdings must exist (see holdingsLead). */
export function holdingsLead(data: FundData): boolean {
  return data.assetClass === "Private Credit" && !!data.topHoldings && data.topHoldings.items.length > 0;
}

/** The largest named borrowers as ranked bars, filtered by the sector chips. */
export default function HoldingsLead({ data, sector }: { data: FundData; sector: string | null }) {
  const all = data.topHoldings!.items;
  const shown = sector ? all.filter((h) => h.sector === sector) : all;
  const max = Math.max(...all.map((h) => h.pctOfNetAssets), 0.1);
  const total = shown.reduce((t, h) => t + h.pctOfNetAssets, 0);
  const sectorLabel = data.sectors.find((s) => s.key === sector)?.label;
  return (
    <section aria-labelledby="holdings-lead-h" className="rounded-card border border-line bg-bg-raised p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">{data.fund} · Named holdings</p>
          <h2 id="holdings-lead-h" className="mt-1 font-serif text-[22px] font-medium leading-tight text-ink">
            {sectorLabel ? `Largest ${sectorLabel} borrowers` : "Largest borrowers"}
          </h2>
        </div>
        <p className="tnum text-xs text-muted-strong">
          {shown.length > 0 ? (
            <>
              {shown.length === all.length ? `Top ${all.length}` : `${shown.length} of the top ${all.length}`}: <span className="font-medium text-ink">{formatPct(total)}</span> of net assets
            </>
          ) : null}
        </p>
      </div>
      {shown.length === 0 ? (
        <p className="py-6 text-sm text-muted-strong">None of the {all.length} largest borrowers is in {sectorLabel ?? "this sector"}.</p>
      ) : (
        <ol className="space-y-3">
          {shown.map((h) => (
            <li key={h.name} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
              <span className="tnum text-xs text-muted">{all.indexOf(h) + 1}</span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-sm font-medium text-ink">{h.name}</span>
                  <span className="hidden truncate text-xs text-muted sm:inline">{h.sector}</span>
                </div>
                <div aria-hidden className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-map-empty">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(h.pctOfNetAssets / max) * 100}%` }} />
                </div>
              </div>
              <div className="tnum text-right">
                <span className="block text-sm text-ink">{formatPct(h.pctOfNetAssets)}</span>
                <span className="block text-[11px] text-muted">{formatMoneyMillions(h.fairValueMillions)}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-4 text-xs leading-relaxed text-muted">{data.topHoldings!.basis}</p>
    </section>
  );
}
