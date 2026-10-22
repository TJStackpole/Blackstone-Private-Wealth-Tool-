import { TAX } from "@/lib/addons/tax-lens/data";
import { FUNDS } from "@/lib/addons/shared/funds";
import { AsOfSource } from "@/components/addons/shared/Badges";
import type { FundCode } from "@/config/addons";

/** BCRED, BXPE and BX Infra are taxed differently, so they get a plain note instead of the calculator. */
export default function OtherFunds({ only }: { only?: FundCode }) {
  const entries = Object.entries(TAX.otherFunds).filter(([f]) => !only || f === only) as [Exclude<FundCode, "BREIT">, (typeof TAX.otherFunds)["BCRED"]][];
  return (
    <ul className="grid gap-3 md:grid-cols-3">
      {entries.map(([f, n]) => (
        <li key={f} className="flex flex-col gap-2 rounded-card border border-line bg-bg-raised p-4 sm:p-5">
          <p className="text-sm font-medium text-ink">
            {FUNDS[f].label} <span className="font-normal text-muted">· {n.structure}</span>
          </p>
          <p className="text-sm leading-relaxed text-muted-strong">{n.text}</p>
          <div className="mt-auto">
            <AsOfSource asOf="2025-12-31" source={n.source} />
          </div>
        </li>
      ))}
    </ul>
  );
}
