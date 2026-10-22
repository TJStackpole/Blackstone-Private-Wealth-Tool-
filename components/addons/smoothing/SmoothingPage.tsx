import AddonShell from "@/components/addons/shared/AddonShell";
import ClientScriptCard from "@/components/addons/shared/ClientScriptCard";
import PrintOnePager from "@/components/addons/shared/PrintOnePager";
import { ADDON_DISCLOSURE } from "@/components/addons/shared/AddonDisclosure";
import { CONTENT } from "@/lib/addons/smoothing/data";
import Explainer from "./Explainer";
import Objections from "./Objections";
import SmoothChart from "./SmoothChart";

export const IC_SMOOTHING = [
  "How is the value per share set, how often, and who reviews it independently?",
  "Do we model this with its reported volatility or with a desmoothed estimate?",
  "What would tell us the value is out of step: redemption requests, secondary-market prices, or both?",
];

/** Add-on 2: why a private fund's value moves so little, and what that does and doesn't mean. */
export default function SmoothingPage() {
  return (
    <AddonShell
      addonId="smoothing"
      title="Why So Smooth?"
      subtitle="A private fund's value comes from appraisals and models, not daily trading, so it moves less than a stock or a listed REIT. Here's why, what that does and doesn't mean, and how to talk about it before a client asks."
    >
      <div className="space-y-12">
        <Explainer />
        <PrintOnePager title="Why So Smooth? one-pager">
          <div className="space-y-12 print:space-y-4">
            <div className="hidden print:block">
              <h2 className="font-serif text-xl">Why So Smooth? Appraised values vs. traded prices</h2>
              <p className="mt-1 text-xs">
                Private funds are valued by appraisals and models, not daily trading, so their values move more gradually. That lowers measured volatility, not
                necessarily risk.
              </p>
            </div>
            <section aria-labelledby="sm-chart-h" className="space-y-4 print:space-y-2">
              <h2 id="sm-chart-h" className="font-serif text-[22px] font-medium leading-tight text-ink print:hidden">
                Side by side
              </h2>
              <p className="no-print max-w-3xl text-sm leading-relaxed text-muted-strong">
                An appraised series and a traded one over the same quarters. Turn on the market-style estimate to see what the appraised line might look like if
                it were priced like the traded one.
              </p>
              <SmoothChart />
            </section>
            <ClientScriptCard title="The 30-second answer to “Why does this look so stable?”" points={CONTENT.script} icPoints={IC_SMOOTHING} />
            <section aria-labelledby="sm-obj-h" className="space-y-4 print:space-y-2">
              <h2 id="sm-obj-h" className="font-serif text-[22px] font-medium leading-tight text-ink print:text-base">
                If the client says…
              </h2>
              <Objections />
            </section>
            <p className="hidden border-t pt-2 text-[10px] print:block">
              {ADDON_DISCLOSURE} Independent prototype built from public filings. Not affiliated with or endorsed by Blackstone.
            </p>
          </div>
        </PrintOnePager>
      </div>
    </AddonShell>
  );
}
