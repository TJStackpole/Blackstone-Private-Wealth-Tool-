import type { TaxYear } from "@/lib/addons/tax-lens/roc";

const k = (n: number) => `$${Math.round(n / 1000)}k`;

/** Cost basis at the start and after each year, as shrinking bars. */
export default function BasisBars({ invested, rows }: { invested: number; rows: TaxYear[] }) {
  const items = [{ label: "Bought", value: invested }, ...rows.map((r) => ({ label: `Year ${r.year}`, value: r.basisEnd }))];
  return (
    <figure className="space-y-2">
      <ul className="space-y-1.5" aria-label="Cost basis by year">
        {items.map((it) => (
          <li key={it.label} className="grid grid-cols-[64px_1fr_52px] items-center gap-3 text-xs">
            <span className="text-muted-strong">{it.label}</span>
            <span className="h-3 overflow-hidden rounded-full bg-line" aria-hidden>
              <span className="block h-full rounded-full bg-accent" style={{ width: `${invested > 0 ? (it.value / invested) * 100 : 0}%` }} />
            </span>
            <span className="tnum text-right text-ink">{k(it.value)}</span>
          </li>
        ))}
      </ul>
      <figcaption className="text-xs text-muted">Cost basis: what the tax system counts as the price paid. Each year&apos;s return of capital lowers it.</figcaption>
    </figure>
  );
}
