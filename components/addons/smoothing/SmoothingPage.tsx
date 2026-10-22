import AddonShell from "@/components/addons/shared/AddonShell";
import PrintOnePager from "@/components/addons/shared/PrintOnePager";
import { ADDON_DISCLOSURE } from "@/components/addons/shared/AddonDisclosure";
import Explainer from "./Explainer";
import Objections from "./Objections";
import SmoothChart from "./SmoothChart";

const BREIT_10K = {
  name: "BREIT Form 10-K, year ended December 31, 2025",
  url: "https://www.sec.gov/Archives/edgar/data/1662972/000166297226000032/breit-20251231.htm",
};
const BXINFRA_10K = {
  name: "BX Infra Form 10-K, year ended December 31, 2025",
  url: "https://www.sec.gov/Archives/edgar/data/2030772/000119312526096453/d70902d10k.htm",
};

/** Add-on 2: why a private fund's value moves so little, and what that does and doesn't mean. */
export default function SmoothingPage() {
  return (
    <AddonShell
      addonId="smoothing"
      title="Why So Smooth?"
      subtitle="Appraised values move gently. Here's what that does, and doesn't, mean."
      glance={[
        { value: "Monthly", label: "BREIT updates its value per share", source: BREIT_10K },
        { value: "Yearly", label: "Each BREIT property is re-appraised, at least", source: BREIT_10K },
        { value: "Quarterly", label: "Full valuations for BX Infra and BXPE, updated monthly", source: BXINFRA_10K },
      ]}
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
              <p className="no-print max-w-3xl text-sm text-muted-strong">An appraised line and a traded one over the same quarters. Turn on the estimate to see the appraised line priced like the traded one.</p>
              <SmoothChart />
            </section>
            <section aria-labelledby="sm-obj-h" className="space-y-4 print:space-y-2">
              <h2 id="sm-obj-h" className="font-serif text-[22px] font-medium leading-tight text-ink print:text-base">
                Common questions
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
