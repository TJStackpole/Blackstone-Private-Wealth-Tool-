import type { FundCode } from "@/config/addons";
import { FUNDS } from "@/lib/addons/shared/funds";
import { THEMES, themeSectors, themeWeight } from "@/lib/addons/themes/tags";

const ORDER: FundCode[] = ["BREIT", "BXINFRA", "BXPE", "BCRED"];

/** Theme × fund: each cell is the fund's published share in that theme's sectors. */
export default function ThemeMatrix({ only }: { only?: FundCode }) {
  const funds = only ? [only] : ORDER;
  return (
    <div className="overflow-x-auto rounded-card border border-line">
      <table className="tnum w-full min-w-[560px] text-right text-sm">
        <caption className="sr-only">Share of each fund in each theme</caption>
        <thead className="bg-bg-raised text-[11px] uppercase tracking-[0.08em] text-muted">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-medium">Theme</th>
            {funds.map((f) => (
              <th key={f} scope="col" className="px-3 py-2 font-medium">
                {FUNDS[f].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {THEMES.map((t) => (
            <tr key={t.id}>
              <th scope="row" className="px-3 py-2 text-left font-normal">
                <span className="block text-ink">{t.label}</span>
                <span className="block text-[11px] text-muted">{t.description}</span>
              </th>
              {funds.map((f) => {
                const w = themeWeight(t, f);
                return (
                  <td key={f} className="px-3 py-2 align-top" title={themeSectors(t, f).map((s) => `${s.key} ${s.pct}%`).join(" + ")}>
                    {w > 0 ? (
                      <>
                        <span className="block text-ink">{w}%</span>
                        <span className="block text-[11px] text-muted">{themeSectors(t, f).map((s) => s.key).join(" + ")}</span>
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
