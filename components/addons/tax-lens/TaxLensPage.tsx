import Calculator from "./Calculator";
import Link from "next/link";
import { findAddon } from "@/config/addons";
import AddonShell from "@/components/addons/shared/AddonShell";
import PrintOnePager from "@/components/addons/shared/PrintOnePager";
import { ADDON_DISCLOSURE } from "@/components/addons/shared/AddonDisclosure";
import { AsOfSource } from "@/components/addons/shared/Badges";
import { TAX, TAX_FUNDS } from "@/lib/addons/tax-lens/data";
import TaxLensFunds from "./TaxLensFunds";
import RocHistory from "./RocHistory";
import WorkedExample from "./WorkedExample";
import MoreDetails from "@/components/addons/shared/MoreDetails";

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${id}-h`} className="space-y-4">
      <h2 id={`${id}-h`} className="font-serif text-[22px] font-medium leading-tight text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Add-on 3: how each fund's payouts are taxed. BREIT gets the return-of-capital tools; the others their own facts. */
export default function TaxLensPage() {
  const liquidity = findAddon("liquidity");
  return (
    <AddonShell
      addonId="tax-lens"
      title="Tax Lens"
      subtitle="Each fund's payouts are taxed differently. Pick a fund to see how, from its own filings."
      glance={[
        {
          value: `${Math.min(...TAX.rocHistory.map((y) => y.roc)).toFixed(0)}–${Math.max(...TAX.rocHistory.map((y) => y.roc)).toFixed(0)}%`,
          label: `BREIT: payout classified as return of capital, each year ${Math.min(...TAX.rocHistory.map((y) => y.year))}–${Math.max(...TAX.rocHistory.map((y) => y.year))}`,
          source: TAX.source,
        },
        { value: TAX_FUNDS.funds.BCRED.tiles[0].value, label: "BCRED: dividends that were ordinary income, 2023–2025", source: TAX_FUNDS.funds.BCRED.tiles[0].source },
        { value: "K-1", label: "BXPE and BX Infra: partnerships; investors are taxed on their share of income", source: TAX_FUNDS.funds.BXPE.tiles[1].source, also: [TAX_FUNDS.funds.BXINFRA.tiles[1].source] },
      ]}
      badges={<span className="text-xs text-muted">General education, not tax advice. Consult a tax advisor.</span>}
    >
      <TaxLensFunds
        breit={
      <div className="space-y-12">
        <AsOfSource asOf={TAX.asOf} source={TAX.source} />
        <Section title="A worked example" id="example">
          <WorkedExample />
          <p className="text-xs text-muted">
            Round numbers, following the IRS rule on return of capital:{" "}
            <a href={TAX.irs.roc.url} target="_blank" rel="noreferrer noopener" className="underline decoration-line underline-offset-2 hover:text-ink">
              {TAX.irs.roc.name}
            </a>
          </p>
        </Section>

        <Section title="Your numbers" id="calculator">
          <PrintOnePager title="Tax Lens one-pager">
            <h2 className="hidden font-serif text-xl print:block">Tax Lens: BREIT return of capital, illustrated</h2>
            <Calculator />
            <p className="hidden pt-2 text-[10px] print:block">
              Return-of-capital share: BREIT reported {TAX.rocHistory.map((y) => `${y.year} ${y.roc}%`).join(", ")} (Form 10-K filings). {ADDON_DISCLOSURE} Consult a tax
              advisor. Independent prototype built from public filings. Not affiliated with or endorsed by Blackstone.
            </p>
          </PrintOnePager>
          {liquidity && (
            <p className="text-sm text-muted-strong">
              <Link href="/toolkit/liquidity?fund=BREIT" className="underline decoration-line underline-offset-2 hover:text-ink">
                When does the cash arrive if you redeem? See the Liquidity Simulator.
              </Link>
            </p>
          )}
        </Section>

        <div className="space-y-3">
          <MoreDetails id="history" summary="How BREIT's payouts were classified" hint="Return of capital, capital gains and income, 2020–2025, from its 10-Ks">
            <section aria-label="How BREIT's payouts were classified" className="space-y-3">
              <RocHistory />
              <p className="text-xs text-muted">{TAX.defaultRoc.verify}</p>
            </section>
          </MoreDetails>
        </div>
      </div>
        }
      />
    </AddonShell>
  );
}
