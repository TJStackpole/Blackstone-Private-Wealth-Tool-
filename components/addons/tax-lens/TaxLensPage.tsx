import AddonShell from "@/components/addons/shared/AddonShell";
import ClientScriptCard from "@/components/addons/shared/ClientScriptCard";
import { AsOfSource } from "@/components/addons/shared/Badges";
import { TAX } from "@/lib/addons/tax-lens/data";
import OtherFunds from "./OtherFunds";
import RocHistory from "./RocHistory";
import WorkedExample from "./WorkedExample";

export const TAX_SCRIPT = [
  "Most of what this fund has paid out in recent years was classified as return of capital, which isn't taxed when it's received.",
  "Instead it lowers what the tax system counts as the price you paid, so more of the sale price is taxed as a gain when you sell.",
  "The split changes every year and isn't known until the year ends, so this shows how it would have worked, not what will happen. A tax advisor can apply it to the client's situation.",
];

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
  return (
    <AddonShell
      addonId="tax-lens"
      title="Tax Lens"
      subtitle="Much of a REIT's payout can be return of capital: not taxed when received, but it lowers your cost basis, so the tax shows up when you sell. Here's how that works, using BREIT's own year-by-year figures."
      fundId="BREIT"
      badges={
        <>
          <AsOfSource asOf={TAX.asOf} source={TAX.source} />
          <span className="text-[11px] text-muted">General education, not tax advice. Consult a tax advisor.</span>
        </>
      }
    >
      <div className="space-y-12">
        <Section title="A worked example" id="example">
          <p className="max-w-3xl text-sm leading-relaxed text-muted-strong">
            Round numbers, in four steps. The rule behind it is the IRS&apos;s: a nondividend distribution reduces your basis, isn&apos;t taxed until basis reaches
            zero, and after that is taxed as a capital gain.{" "}
            <a href={TAX.irs.roc.url} target="_blank" rel="noreferrer noopener" className="underline decoration-line underline-offset-2 hover:text-ink">
              {TAX.irs.roc.name}
            </a>
          </p>
          <WorkedExample />
        </Section>

        <Section title="How BREIT's payouts were classified" id="history">
          <p className="max-w-3xl text-sm leading-relaxed text-muted-strong">
            Each year&apos;s split is reported in BREIT&apos;s annual reports, linked per row. It has ranged from 85% to 100% return of capital since 2020.
          </p>
          <RocHistory />
          <p className="text-[11px] text-muted">{TAX.defaultRoc.verify}</p>
        </Section>

        <Section title="The other funds are taxed differently" id="other">
          <OtherFunds />
        </Section>

        <ClientScriptCard points={TAX_SCRIPT} />
      </div>
    </AddonShell>
  );
}
