import PrintOnePager from "@/components/addons/shared/PrintOnePager";
import { Glance } from "@/components/addons/shared/AddonShell";
import { ADDON_DISCLOSURE } from "@/components/addons/shared/AddonDisclosure";
import MemoHeader from "./MemoHeader";
import { AsOfSource } from "@/components/addons/shared/Badges";
import { COMPARE } from "@/lib/addons/drawdown-vs-evergreen/data";
import { formatDate } from "@/lib/dates";
import CashDrag from "./CashDrag";
import AtAGlance from "./AtAGlance";
import CompareTable from "./CompareTable";
import MoreDetails from "@/components/addons/shared/MoreDetails";
import WhenEachFits from "./WhenEachFits";

const life = COMPARE.rows.find((r) => r.topic === "Fund life")!;

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

/**
 * How a traditional drawdown fund and an evergreen fund differ, for investors who already own the first kind. The
 * "Evergreen or drawdown?" part of Getting money out.
 */
export function DrawdownBody() {
  return (
    <div className="space-y-8">
      <Glance
        tiles={[
          { value: "Day one", label: "Evergreen: the whole amount is invested when you subscribe" },
          { value: life.drawdownShort, label: "Common life of a traditional drawdown fund", source: life.sources[0] },
        ]}
      />
      <AsOfSource asOf={COMPARE.asOf} source={COMPARE.source} />
      <PrintOnePager title="Investment committee memo">
        <div className="space-y-12 print:space-y-3">
          <MemoHeader />
          <Section title="At a glance" id="compare">
            <div className="print:hidden">
              <AtAGlance />
            </div>
            <MoreDetails summary="Full comparison, with sources" hint="Eight topics, from each fund's filings and industry guides">
              <CompareTable />
            </MoreDetails>
            <div className="hidden print:block">
              <CompareTable />
            </div>
          </Section>
          <Section title="How much money is actually at work" id="cash-drag">
            <CashDrag />
          </Section>
          <Section title="When each fits" id="fits" printHide>
            <WhenEachFits />
          </Section>
          <section aria-label="Questions for the investment committee" className="hidden print:block">
            <h3 className="font-serif text-sm">Questions the investment committee may ask</h3>
            <ul className="list-disc pl-4 text-xs">
              {IC_SCRIPT.map((q) => (
                <li key={q.slice(0, 30)}>{q}</li>
              ))}
            </ul>
          </section>
          {/* The table's per-row sources are screen-only; on paper they're listed once, with the date. */}
          <p className="hidden text-[9px] print:block" data-print-sources>
            {COMPARE.evergreenExample} figures as of {formatDate(COMPARE.asOf, "long")}. Sources:{" "}
            {COMPARE.rows
              .flatMap((r) => r.sources ?? [])
              .filter((s, i, all) => s.url.startsWith("http") && all.findIndex((o) => o.url === s.url) === i)
              .map((s) => s.name)
              .join("; ")}
            .
          </p>
          <p className="hidden border-t pt-1 text-[9px] print:block">
            {ADDON_DISCLOSURE} Illustrative model; both structures are assumed to earn the same return. Independent prototype built from public filings. Not
            affiliated with or endorsed by Blackstone.
          </p>
        </div>
      </PrintOnePager>
    </div>
  );
}
