import Link from "next/link";
import { findAddon } from "@/config/addons";
import AddonShell from "@/components/addons/shared/AddonShell";
import Steps from "@/components/addons/shared/Steps";
import { AsOfSource } from "@/components/addons/shared/Badges";
import { HISTORY, TERMS } from "@/lib/addons/liquidity/data";
import HistoryTimeline from "./HistoryTimeline";
import LiquidityPrint from "./LiquidityPrint";
import ProRataDemo from "./ProRataDemo";
import ReserveCheck from "./ReserveCheck";
import TermsTable from "./TermsTable";
import UrlSimulator from "./UrlSimulator";



function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-h` : undefined} className="space-y-4">
      <h2 id={id ? `${id}-h` : undefined} className="font-serif text-[22px] font-medium leading-tight text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Add-on 4: how redemption limits work, each fund's terms, and what has happened before. */
export default function LiquidityPage() {
  const taxLens = findAddon("tax-lens");
  return (
    <AddonShell
      addonId="liquidity"
      title="Liquidity Simulator"
      subtitle="How these funds pay you back when you sell: on a schedule, up to a limit."
      glance={[
        { value: "2% · 5%", label: "BREIT: most it buys back a month · a quarter (% of NAV)" },
        { value: "5%", label: "BCRED: quarterly target (% of shares)" },
        { value: "3%", label: "BXPE and BX Infra: quarterly limit (% of units)" },
      ]}
      badges={<AsOfSource asOf={TERMS.asOf} source={TERMS.source} />}
    >
      <div className="space-y-12">
        <Section title="How the line works" id="line">
          <Steps
            steps={[
              { title: "You ask to sell", text: "There's no stock exchange, so the fund buys your shares back." },
              { title: "The fund pays up to its limit", text: "A few percent of the whole fund each month or quarter." },
              { title: "Over the limit? Everyone gets the same share", text: "The rest stays invested and can be asked for again." },
            ]}
          />
          <ProRataDemo />
        </Section>

        <Section title="What happens to a request" id="simulator">
          <p className="max-w-3xl text-sm text-muted-strong">Pick a fund and a scenario to see when the money arrives.</p>
          <UrlSimulator />
          {taxLens && (
            <p className="text-sm text-muted-strong">
              <Link href="/toolkit/tax-lens" className="underline decoration-line underline-offset-4 hover:text-ink">
                Redeeming early? See when cash arrives and when tax is due in the Tax Lens.
              </Link>
            </p>
          )}
        </Section>

        <Section title="Will you need to sell?" id="reserve">
          <p className="max-w-3xl text-sm text-muted-strong">Compare your other savings with a year of spending.</p>
          <ReserveCheck />
        </Section>

        <Section title="Each fund's terms" id="terms">
          <p className="max-w-3xl text-sm text-muted-strong">From each fund&apos;s latest quarterly filing. Terms can change; the offering documents control.</p>
          <TermsTable />
        </Section>

        <Section title="When the limits have applied" id="history">
          <p className="max-w-3xl text-sm text-muted-strong">Dated events from the funds&apos; own SEC filings.</p>
          <HistoryTimeline />
          <AsOfSource asOf={HISTORY.asOf} source={HISTORY.events[HISTORY.events.length - 1].source} />
        </Section>

        <LiquidityPrint />
      </div>
    </AddonShell>
  );
}
