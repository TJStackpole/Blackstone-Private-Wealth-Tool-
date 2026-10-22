import { COMPARE } from "@/lib/compare";
import { FUNDS } from "@/lib/addons/shared/funds";
import type { FundCode } from "@/config/addons";

const row = (id: string) => COMPARE.rows.find((r) => r.id === id)!;

/** Each fund's fees, from its own filing: one line per fund. Same cells as the side-by-side table. */
export function fundFees() {
  const mgmt = row("management");
  const perf = row("performance");
  return COMPARE.funds.map((f: FundCode) => ({
    fund: f,
    label: FUNDS[f].label,
    management: mgmt.cells[f],
    performance: perf.cells[f],
  }));
}

export default function FundFees() {
  return (
    <ul className="space-y-2" aria-label="Each fund's fees, from its own filing">
      {fundFees().map(({ fund, label, management: m, performance: p }) => {
        const src = m.sources?.[0] ?? p.sources?.[0];
        return (
          <li key={fund} data-fee={fund} className="text-sm leading-snug">
            <p className="text-muted-strong">
              <span className="font-medium text-ink">{label}</span> <span className="tnum">{m.value ?? m.missing ?? "Not in filing"}</span>
              {m.note ? ` ${m.note}` : ""} · <span className="tnum">{p.value ?? p.missing ?? "Not in filing"}</span> performance fee
            </p>
            <p className="text-[11px] leading-snug text-muted">
              {p.note}{" "}
              {src && (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  title={src.page ? `${src.name}, ${src.page}` : src.name}
                  className="underline decoration-line underline-offset-2 hover:text-ink"
                >
                  {src.name.replace(/, (quarter|year) ended .*$/, "")}
                  {src.page ? `, ${src.page.split(":")[0]}` : ""}
                </a>
              )}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
