import { TAX } from "@/lib/addons/tax-lens/data";

/** How BREIT's payouts were classified for tax each year, from its annual reports. */
export default function RocHistory() {
  return (
    <div className="overflow-x-auto rounded-card border border-line">
      <table className="tnum w-full min-w-[420px] text-right text-sm">
        <caption className="sr-only">Tax character of BREIT distributions by year</caption>
        <thead className="bg-bg-raised text-[11px] uppercase tracking-[0.08em] text-muted">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-medium">Year</th>
            <th scope="col" className="px-3 py-2 font-medium">Return of capital</th>
            <th scope="col" className="px-3 py-2 font-medium">Capital gains</th>
            <th scope="col" className="px-3 py-2 font-medium">Ordinary income</th>
            <th scope="col" className="px-3 py-2 text-left font-medium">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {TAX.rocHistory.map((y) => (
            <tr key={y.year}>
              <th scope="row" className="px-3 py-2 text-left font-normal text-ink">{y.year}</th>
              <td className="px-3 py-2 text-ink">{y.roc}%</td>
              <td className="px-3 py-2 text-muted-strong">{y.capitalGains}%</td>
              <td className="px-3 py-2 text-muted-strong">{y.ordinary}%</td>
              <td className="px-3 py-2 text-left text-xs">
                <a href={y.source.url} target="_blank" rel="noreferrer noopener" className="text-muted-strong underline decoration-line underline-offset-2 hover:text-ink">
                  {y.source.name.replace("BREIT Form ", "").replace(", year ended December 31,", " FY")}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
