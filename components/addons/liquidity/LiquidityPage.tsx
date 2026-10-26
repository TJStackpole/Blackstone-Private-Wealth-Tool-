import { findAddon } from "@/config/addons";
import AddonShell from "@/components/addons/shared/AddonShell";
import Steps from "@/components/addons/shared/Steps";
import { AsOfSource } from "@/components/addons/shared/Badges";
import FundLink from "@/components/addons/shared/FundLink";
import { formatDate } from "@/lib/dates";
import { HISTORY, TERMS } from "@/lib/addons/liquidity/data";
import MoreDetails from "@/components/addons/shared/MoreDetails";
import FillChart from "./FillChart";
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


const terms = (f: string) => TERMS.funds.find((t) => t.fund === f)!;
const limit = (f: string, i: number) => terms(f).limits[i].value;

/** Add-on 4: how redemption limits work, each fund's terms, and what has happened before. */
export default function LiquidityPage() {
  const taxLens = findAddon("tax-lens");
  return (
    <AddonShell
      addonId="liquidity"
      title="Liquidity Simulator"
      subtitle="Shares are bought back on a schedule, up to a set limit. Here's when the money arrives."
      glance={[
        { value: `${limit("BREIT", 0)}% · ${limit("BREIT", 1)}%`, label: "BREIT: most it buys back a month · a quarter (% of NAV)", source: terms("BREIT").limits[0].source },
        { value: `${limit("BCRED", 0)}%`, label: "BCRED: quarterly target (% of shares)", source: terms("BCRED").limits[0].source },
        {
          value: `${limit("BXPE", 0)}%`,
          label: limit("BXPE", 0) === limit("BXINFRA", 0) ? "BXPE and BX Infra: quarterly limit (% of units)" : "BXPE: quarterly limit (% of units)",
          source: terms("BXPE").limits[0].source,
          ...(limit("BXPE", 0) === limit("BXINFRA", 0) ? { also: [terms("BXINFRA").limits[0].source] } : {}),
        },
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
          <UrlSimulator />
          {taxLens && (
            <p className="text-sm text-muted-strong">
              <FundLink href="/toolkit/tax-lens" className="underline decoration-line underline-offset-4 hover:text-ink">
                When is tax due on what you receive? See the Tax Lens.
              </FundLink>
            </p>
          )}
        </Section>

        <Section title="Will you need to sell?" id="reserve">
          <ReserveCheck />
        </Section>

        <Section title="When the limits have applied" id="history">
          <FillChart />
          {/* Each bar has its own filing (BREIT's 10-K and 10-Qs, BCRED's 10-Q and letters), listed event by event below. */}
          <p className="text-xs leading-relaxed text-muted">
            <span className="tnum">As of {formatDate(HISTORY.asOf)}</span> · Sources: each event&apos;s own filing, under &ldquo;Each event, with sources&rdquo; below.
          </p>
          <div className="space-y-3">
            <MoreDetails id="events" summary="Each event, with sources" hint="BREIT 2022–2024 and BCRED 2026, from the funds' filings">
              <HistoryTimeline />
            </MoreDetails>
            <MoreDetails id="terms" summary="Each fund's terms" hint="Limits, early-sale deductions and the manager's discretion">
              <TermsTable />
            </MoreDetails>
          </div>
        </Section>

        <LiquidityPrint />
      </div>
    </AddonShell>
  );
}
