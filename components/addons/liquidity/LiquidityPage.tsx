import AddonShell from "@/components/addons/shared/AddonShell";
import ClientScriptCard from "@/components/addons/shared/ClientScriptCard";
import { AsOfSource } from "@/components/addons/shared/Badges";
import { HISTORY, TERMS } from "@/lib/addons/liquidity/data";
import HistoryTimeline from "./HistoryTimeline";
import ProRataDemo from "./ProRataDemo";
import TermsTable from "./TermsTable";

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
  return (
    <AddonShell
      addonId="liquidity"
      title="Liquidity Simulator"
      subtitle="These funds let investors sell shares back on a schedule, up to a limit. When more people ask than the limit allows, everyone in line gets the same fraction. Here's how that works, what each fund's limits are, and when the limits have applied before."
      badges={<AsOfSource asOf={TERMS.asOf} source={TERMS.source} />}
    >
      <div className="space-y-12">
        <Section title="How the line works" id="line">
          <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-muted-strong">
            <p>
              A perpetual fund doesn&apos;t trade on an exchange. To get money out, an investor asks the fund to buy shares back. The fund sets aside up to a
              set amount each month or quarter for these buybacks, usually a few percent of the whole fund.
            </p>
            <p>
              If total requests fit under that amount, everyone is paid in full. If they don&apos;t, every request is filled by the same fraction. That&apos;s
              called pro rata. Nobody is first in line; the unfilled part stays invested at the fund&apos;s value, and can be requested again.
            </p>
          </div>
          <ProRataDemo />
        </Section>

        <Section title="Each fund's terms" id="terms">
          <p className="max-w-3xl text-sm leading-relaxed text-muted-strong">
            Each number is a parameter taken from the fund&apos;s latest quarterly filing, with a link. Terms can change, and the offering documents control.
          </p>
          <TermsTable />
        </Section>

        <Section title="When the limits have applied" id="history">
          <p className="max-w-3xl text-sm leading-relaxed text-muted-strong">Dated events reported in the funds&apos; own SEC filings.</p>
          <HistoryTimeline />
          <AsOfSource asOf={HISTORY.asOf} source={HISTORY.events[HISTORY.events.length - 1].source} />
        </Section>

        <ClientScriptCard
          points={[
            "These funds pay out on a schedule, up to a limit, not on demand like a mutual fund.",
            "When many people ask at once, everyone gets the same share of their request, and the rest stays invested until the next window.",
            "That has happened before: BREIT limited repurchases at times between late 2022 and early 2024, and BCRED prorated requests in the second and third quarters of 2026.",
          ]}
        />
      </div>
    </AddonShell>
  );
}
