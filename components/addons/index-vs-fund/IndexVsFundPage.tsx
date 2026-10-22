import AddonShell from "@/components/addons/shared/AddonShell";
import { SampleBadge } from "@/components/addons/shared/Badges";
import { INDEX_VS_FUND } from "@/lib/addons/index-vs-fund/data";
import UrlView from "./UrlView";

// Every tile states a figure that's the same in all four funds' filings; BREIT's 10-Q is linked as the example.
const fees = INDEX_VS_FUND.BREIT.fees;
const src = (s: { url: string }) => ({ name: "Each fund's 10-Q (BREIT's linked)", url: s.url });

/** Add-on 1: puts a brochure's index return next to what each share class of the fund actually reported. */
export default function IndexVsFundPage() {
  return (
    <AddonShell
      addonId="index-vs-fund"
      title="Index-to-Fund Translator"
      subtitle="From a brochure's index to what each share class earned, step by step."
      glance={[
        { value: `${fees.management.value}%`, label: "Yearly management fee, all four funds", source: src(fees.management.source) },
        { value: `${fees.performance.value}%`, label: "Performance or incentive fee rate, above a hurdle, all four funds", source: src(fees.performance.source) },
        { value: `${fees.servicing.I} · ${fees.servicing.D} · ${fees.servicing.S}%`, label: "Yearly servicing fee: Class I · D · S", source: src(fees.servicing.source) },
      ]}
      badges={
        <>
          <SampleBadge />
          <span className="text-xs text-muted">Index figures: sample until checked with the provider. Fund figures: each fund&apos;s 10-Q.</span>
        </>
      }
    >
      <div className="space-y-12">
        <UrlView />
      </div>
    </AddonShell>
  );
}
