import AddonShell from "@/components/addons/shared/AddonShell";
import ClientScriptCard from "@/components/addons/shared/ClientScriptCard";
import { AsOfSource } from "@/components/addons/shared/Badges";
import { COMPARE } from "@/lib/addons/drawdown-vs-evergreen/data";
import CompareTable from "./CompareTable";
import WhenEachFits from "./WhenEachFits";

export const ADVISOR_SCRIPT = [
  "With a traditional private fund, you promise an amount and the manager takes it bit by bit over several years, so much of it waits in cash.",
  "An evergreen fund invests the whole amount on day one, in a portfolio that already exists. In exchange, getting money out depends on the fund's repurchase limits.",
  "Neither is better in general. It depends on whether you'd rather manage future capital calls or a redemption queue.",
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

/** Add-on 7: how a traditional drawdown fund and an evergreen fund differ, for investors who already own the first kind. */
export default function DrawdownPage() {
  return (
    <AddonShell
      addonId="drawdown-vs-evergreen"
      title="Drawdown vs. Evergreen"
      subtitle="Family offices often own private assets through traditional drawdown funds. The question is less whether to own private markets than whether an evergreen fund adds something. Here's how the two structures differ."
      badges={<AsOfSource asOf={COMPARE.asOf} source={COMPARE.source} />}
    >
      <div className="space-y-12">
        <Section title="The two structures, side by side" id="compare">
          <CompareTable />
        </Section>
        <Section title="When each fits" id="fits">
          <WhenEachFits />
        </Section>
        <ClientScriptCard points={ADVISOR_SCRIPT} />
      </div>
    </AddonShell>
  );
}
