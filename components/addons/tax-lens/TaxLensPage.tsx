import Calculator from "./Calculator";
import Link from "next/link";
import { findAddon } from "@/config/addons";
import AddonShell from "@/components/addons/shared/AddonShell";
import PrintOnePager from "@/components/addons/shared/PrintOnePager";
import { ADDON_DISCLOSURE } from "@/components/addons/shared/AddonDisclosure";
import { AsOfSource } from "@/components/addons/shared/Badges";
import { TAX } from "@/lib/addons/tax-lens/data";
import OtherFunds from "./OtherFunds";
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

/** Add-on 3: how return of capital is taxed now and at sale, for BREIT. Other funds get a note. */
export default function TaxLensPage() {
  const liquidity = findAddon("liquidity");
  return (
    <AddonShell
      addonId="tax-lens"
      title="Tax Lens"
      subtitle="Most of BREIT's payout isn't taxed when received. The tax waits until you sell."
      glance={[
        { value: "100%", label: "Share of BREIT's 2025 payouts classified as return of capital" },
        { value: "85–100%", label: "That share each year since 2020" },
        { value: "4.6%", label: "Class I yearly payout rate, Q2 2026" },
      ]}
      fundId="BREIT"
      badges={
        <>
          <AsOfSource asOf={TAX.asOf} source={TAX.source} />
          <span className="text-xs text-muted">General education, not tax advice. Consult a tax advisor.</span>
        </>
      }
    >
      <div className="space-y-12">
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
                Redeeming early? See when cash arrives and when tax is due in the Liquidity Simulator.
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
          <MoreDetails id="other" summary="The other funds are taxed differently" hint="BCRED, BXPE and BX Infra">
            <OtherFunds />
          </MoreDetails>
        </div>
      </div>
    </AddonShell>
  );
}
