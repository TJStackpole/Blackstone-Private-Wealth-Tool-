import AddonShell from "@/components/addons/shared/AddonShell";
import PrintOnePager from "@/components/addons/shared/PrintOnePager";
import { ADDON_DISCLOSURE } from "@/components/addons/shared/AddonDisclosure";
import MemoHeader from "./MemoHeader";
import ClientScriptCard from "@/components/addons/shared/ClientScriptCard";
import { AsOfSource } from "@/components/addons/shared/Badges";
import { COMPARE } from "@/lib/addons/drawdown-vs-evergreen/data";
import CashDrag from "./CashDrag";
import CompareTable from "./CompareTable";
import WhenEachFits from "./WhenEachFits";

export const ADVISOR_SCRIPT = [
  "With a traditional private fund, you promise an amount and the manager takes it bit by bit over several years, so much of it waits in cash.",
  "An evergreen fund invests the whole amount on day one, in a portfolio that already exists. In exchange, getting money out depends on the fund's repurchase limits.",
  "Neither is better in general. It depends on whether you'd rather manage future capital calls or a redemption queue.",
];

export const IC_SCRIPT = [
  "How much of our existing drawdown commitments is still uncalled, and what does that cash earn while it waits?",
  "Would an evergreen allocation reduce cash drag enough to justify its repurchase limits and fee structure?",
  "How would the evergreen fund's repurchase limits interact with our own liquidity needs and capital calls?",
];

function Section({ title, id, children, printHide = false }: { title: string; id: string; children: React.ReactNode; printHide?: boolean }) {
  return (
    <section aria-labelledby={`${id}-h`} className={`space-y-4 print:space-y-1 ${printHide ? "print:hidden" : ""}`}>
      <h2 id={`${id}-h`} className="font-serif text-[22px] font-medium leading-tight text-ink print:text-sm">
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
      <PrintOnePager title="Investment committee memo">
        <div className="space-y-12 print:space-y-3">
          <MemoHeader />
          <Section title="The two structures, side by side" id="compare">
            <CompareTable />
          </Section>
          <Section title="How much money is actually at work" id="cash-drag">
            <p className="no-print max-w-3xl text-sm leading-relaxed text-muted-strong">
              A drawdown commitment is called over several years, and money starts coming back before the last calls, so only part of it is ever invested
              at once. Change the call schedule to see the gap move.
            </p>
            <CashDrag />
          </Section>
          <Section title="When each fits" id="fits" printHide>
            <WhenEachFits />
          </Section>
          <ClientScriptCard points={ADVISOR_SCRIPT} icPoints={IC_SCRIPT} icInPrint />
          <p className="hidden border-t pt-1 text-[9px] print:block">
            {ADDON_DISCLOSURE} Illustrative model; both structures are assumed to earn the same return. Independent prototype built from public filings. Not
            affiliated with or endorsed by Blackstone.
          </p>
        </div>
      </PrintOnePager>
    </AddonShell>
  );
}
