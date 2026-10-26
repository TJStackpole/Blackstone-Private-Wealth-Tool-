import { Glance } from "@/components/addons/shared/AddonShell";
import { SampleBadge } from "@/components/addons/shared/Badges";
import { INDEX_VS_FUND } from "@/lib/addons/index-vs-fund/data";
import UrlView from "./UrlView";

// Each tile states a fee that's the same in all four funds' filings; BREIT's filing is linked as the example.
const fees = INDEX_VS_FUND.BREIT.fees;
const src = (s: { name: string; url: string }) => ({ name: `Each fund's filings (BREIT's ${s.name.includes("10-K") ? "10-K" : "10-Q"} linked)`, url: s.url });

/** From a brochure's index return to what each share class earned, step by step. The second part of Returns, explained. */
export function IndexBody() {
  return (
    <div className="space-y-8">
      <Glance
        tiles={[
          { value: `${fees.management.value}%`, label: "Yearly management fee, all four funds", source: src(fees.management.source) },
          { value: `${fees.performance.value}%`, label: "Performance or incentive fee rate, above a hurdle, all four funds", source: src(fees.performance.source) },
          { value: `${fees.servicing.I} · ${fees.servicing.D} · ${fees.servicing.S}%`, label: "Yearly servicing fee: Class I · D · S", source: src(fees.servicing.source) },
        ]}
      />
      <div className="flex flex-wrap items-center gap-2">
        <SampleBadge />
        <span className="text-xs text-muted">Index figures: sample until checked with the provider. Fund figures: each fund&apos;s own filings.</span>
      </div>
      <UrlView />
    </div>
  );
}
