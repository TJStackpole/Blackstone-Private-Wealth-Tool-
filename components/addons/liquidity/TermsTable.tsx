import { TERMS } from "@/lib/addons/liquidity/data";
import { FUNDS } from "@/lib/addons/shared/funds";
import { formatDate } from "@/lib/aggregate";

/** Each fund's repurchase terms, every number linked to the filing it came from. */
export default function TermsTable() {
  return (
    <>
      {/* Phones: one card per fund. */}
      <ul className="space-y-3 sm:hidden">
        {TERMS.funds.map((f) => (
          <li
            key={f.fund}
            className="rounded-card border border-line bg-bg-raised p-4 sm:p-5 text-sm"
          >
            <p className="font-medium text-ink">{FUNDS[f.fund].label}</p>
            <p className="mt-1 text-muted-strong">{f.howOften}</p>
            <p className="tnum mt-2 text-ink">
              {f.limits
                .map(
                  (l) =>
                    `${l.value}% ${l.unit.replace(/^% /, "")} (${l.label.toLowerCase()})`,
                )
                .join(" · ")}
            </p>
            <p className="tnum mt-1 text-ink">
              Early sale deduction: {f.earlyDeduction.value}% if held under{" "}
              {f.earlyDeduction.heldUnder}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-strong">
              {f.discretion}
            </p>
            <a
              href={f.limits[0].source.url}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1 block text-xs text-muted underline decoration-line underline-offset-2"
            >
              {f.limits[0].source.name} · {f.limits[0].source.page}
            </a>
            <span className="block text-xs text-muted">
              {f.limits[0].verify}.
            </span>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto rounded-card border border-line sm:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Repurchase terms by fund</caption>
          <thead className="bg-bg-raised text-[11px] uppercase tracking-[0.08em] text-muted">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">
                Fund
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                How often
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Limits
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Early sale deduction
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Manager&apos;s discretion
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {TERMS.funds.map((f) => (
              <tr key={f.fund} className="align-top">
                <th scope="row" className="px-3 py-3 font-medium text-ink">
                  {FUNDS[f.fund].label}
                </th>
                <td className="px-3 py-3 text-muted-strong">{f.howOften}</td>
                <td className="px-3 py-3">
                  <ul className="space-y-1">
                    {f.limits.map((l) => (
                      <li key={l.label} className="tnum text-ink">
                        {l.value}%{" "}
                        <span className="text-muted-strong">
                          {l.unit.replace(/^% /, "")}
                        </span>
                        <span className="block text-xs text-muted">
                          {l.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="tnum px-3 py-3 text-ink">
                  {f.earlyDeduction.value}%{" "}
                  <span className="text-muted-strong">
                    if held under {f.earlyDeduction.heldUnder}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs leading-relaxed text-muted-strong">
                  {f.discretion}
                  <a
                    href={f.limits[0].source.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-1 block text-xs text-muted underline decoration-line underline-offset-2 hover:text-ink"
                  >
                    {f.limits[0].source.name} · {f.limits[0].source.page} · as
                    of {formatDate(f.limits[0].asOf)}
                  </a>
                  <span className="block text-xs text-muted">
                    {f.limits[0].verify}.
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
