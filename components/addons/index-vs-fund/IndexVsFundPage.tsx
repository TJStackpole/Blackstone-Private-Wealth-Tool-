import AddonShell from "@/components/addons/shared/AddonShell";
import { SampleBadge } from "@/components/addons/shared/Badges";
import UrlView from "./UrlView";



/** Add-on 1: puts a brochure's index return next to what each share class of the fund actually reported. */
export default function IndexVsFundPage() {
  return (
    <AddonShell
      addonId="index-vs-fund"
      title="Index-to-Fund Translator"
      subtitle="A brochure's index return next to what each share class of the fund earned, and the steps in between."
      glance={[
        { value: "1.25%", label: "Yearly management fee, all four funds" },
        { value: "12.5%", label: "Share of gains paid as a performance or incentive fee, all four funds" },
        { value: "0 · 0.25 · 0.85%", label: "Yearly servicing fee: Class I · D · S" },
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
