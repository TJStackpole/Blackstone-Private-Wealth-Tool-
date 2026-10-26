import { TAX, TAX_FUNDS, type OtherFund } from "@/lib/addons/tax-lens/data";
import { FUNDS } from "@/lib/addons/shared/funds";
import type { AddonSource } from "@/lib/addons/shared/types";
import { IllustrativeBadge } from "@/components/addons/shared/Badges";
import Steps from "@/components/addons/shared/Steps";
import { formatDate } from "@/lib/dates";
import NextUpdate from "@/components/NextUpdate";

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function Src({ s }: { s: AddonSource }) {
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noreferrer noopener"
      title={s.page ? `${s.name}, ${s.page}` : s.name}
      className="text-[11px] text-muted underline decoration-line underline-offset-2 hover:text-ink"
    >
      {s.name.replace(/, (quarter|year) ended .*$/, "")}
      {s.page ? ` · ${s.page.split(":")[0]}` : ""}
    </a>
  );
}

/** Taxed-when-paid vs. deferred, per year: BCRED's dividends next to BREIT's return-of-capital share. */
function CharacterBars({ fund }: { fund: OtherFund }) {
  const h = TAX_FUNDS.funds[fund].history!;
  const breit = Object.fromEntries(TAX.rocHistory.map((r) => [r.year, r.roc]));
  const bar = (label: string, deferred: number) => (
    <div className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-2">
      <span className="text-[11px] text-muted-strong">{label}</span>
      <span className="flex h-3.5 overflow-hidden rounded-sm bg-bg">
        <span className="print-fill h-full bg-accent" style={{ width: `${100 - deferred}%` }} />
        <span className="print-fill-light h-full bg-muted/40" style={{ width: `${deferred}%` }} />
      </span>
      <span className="tnum w-24 text-right text-[11px] text-muted-strong">{deferred.toFixed(0)}% deferred</span>
    </div>
  );
  return (
    <figure className="space-y-3 rounded-card border border-line bg-bg-raised p-4 sm:p-5 print:space-y-1.5 print:p-2">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-ink">How each year&apos;s payout was taxed</span>
        <span className="flex items-center gap-3 text-[11px] text-muted-strong">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="print-fill h-2.5 w-2.5 rounded-sm bg-accent" /> Taxed when paid
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="print-fill-light h-2.5 w-2.5 rounded-sm bg-muted/40" /> Return of capital (deferred to sale)
          </span>
        </span>
      </figcaption>
      <ul className="space-y-3 print:space-y-1">
        {h.rows.map((r) => (
          <li key={r.year} className="space-y-1.5" aria-label={`${r.year}: ${FUNDS[fund].label} ${r.ordinaryPct}% ordinary income; BREIT ${breit[r.year]}% return of capital`}>
            <p className="tnum text-xs font-medium text-ink">
              {r.year} <span className="font-normal text-muted">· {FUNDS[fund].label} paid ${r.perShare.toFixed(2)} a Class I share</span>
            </p>
            {bar(FUNDS[fund].label, 100 - r.ordinaryPct)}
            {breit[r.year] !== undefined && bar("BREIT", breit[r.year])}
          </li>
        ))}
      </ul>
      <p className="text-[11px] leading-snug text-muted">
        <Src s={h.source} /> · BREIT: its Form 10-Ks, as in the BREIT tab.
      </p>
    </figure>
  );
}

/** One fund's tax picture, from its own filings: what it is, three facts, a picture, the points behind them. */
export default function FundTax({ fund, compact = false }: { fund: OtherFund; compact?: boolean }) {
  const f = TAX_FUNDS.funds[fund];
  const ex = f.example;
  return (
    <div className="space-y-6 print:space-y-2.5" data-tax-fund={fund}>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
          {FUNDS[fund].label} · {f.structure}
        </p>
        <p className="mt-1 font-serif text-[26px] leading-tight text-ink print:text-lg">{f.summary}</p>
      </div>

      <ul className={compact ? "grid gap-2" : "grid gap-3 sm:grid-cols-3 print:grid-cols-3 print:gap-2"}>
        {f.tiles.map((t) => (
          <li key={t.label} className="flex flex-col gap-1.5 rounded-card border border-line bg-bg-raised p-4 print:gap-0.5 print:p-2">
            <span className="tnum font-serif text-[24px] leading-none text-ink">{t.value}</span>
            <span className="text-xs leading-snug text-muted-strong">{t.label}</span>
            <span className="mt-auto pt-1">
              <Src s={t.source} />
            </span>
          </li>
        ))}
      </ul>

      {!compact && f.history && <CharacterBars fund={fund} />}
      {!compact && f.steps && <Steps steps={f.steps} />}

      {!compact && (
        <ul className="space-y-2.5 print:space-y-1">
          {f.points.map((p) => (
            <li key={p.text} className="flex gap-3 text-sm leading-relaxed text-ink print:text-xs print:leading-snug">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>
                {p.text} <Src s={p.source} />
              </span>
            </li>
          ))}
        </ul>
      )}

      {ex && (
        <div className="space-y-1.5 rounded-card border border-line p-4 sm:p-5 print:p-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink">In round numbers</p>
            <IllustrativeBadge />
          </div>
          <p className="text-sm leading-relaxed text-muted-strong">
            $100,000 at a {ex.distributionPct}% distribution rate pays about {money(100_000 * (ex.distributionPct / 100))} a year. At a {ex.bracketPct}% bracket, about{" "}
            {money(100_000 * (ex.distributionPct / 100) * (ex.bracketPct / 100))} of that is due in the year it&apos;s paid, with nothing deferred to the sale.
          </p>
          <p className="text-[11px] text-muted">Federal income tax only; leaves out state tax and any deductions. Not tax advice.</p>
        </div>
      )}

      {!compact && (
        <p className="text-xs leading-relaxed text-muted">
          <span className="tnum">As of {formatDate(TAX_FUNDS.asOf)}</span>
          {f.tiles.some((t) => /\b8-K\b/.test(t.source.name)) ? ", except the card from a later monthly 8-K, dated on the card" : ""} ·{" "}
          <NextUpdate asOf={TAX_FUNDS.asOf} />. {TAX_FUNDS.verify}
        </p>
      )}
    </div>
  );
}
