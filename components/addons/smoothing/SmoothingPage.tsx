import AddonShell from "@/components/addons/shared/AddonShell";
import ClientScriptCard from "@/components/addons/shared/ClientScriptCard";
import { CONTENT } from "@/lib/addons/smoothing/data";
import Explainer from "./Explainer";
import SmoothChart from "./SmoothChart";

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
        <section aria-labelledby="sm-chart-h" className="space-y-4">
          <h2 id="sm-chart-h" className="font-serif text-[22px] font-medium leading-tight text-ink">
            Side by side
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-strong">
            An appraised series and a traded one over the same quarters. Turn on the market-style estimate to see what the appraised line might look like if
            it were priced like the traded one.
          </p>
          <SmoothChart />
        </section>
        <ClientScriptCard title="The 30-second answer to “Why does this look so stable?”" points={CONTENT.script} />
      </div>
    </AddonShell>
  );
}
