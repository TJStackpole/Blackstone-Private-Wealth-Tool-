import AddonShell from "@/components/addons/shared/AddonShell";
import ClientScriptCard from "@/components/addons/shared/ClientScriptCard";
import { SampleBadge } from "@/components/addons/shared/Badges";
import UrlView from "./UrlView";

export const IVF_SCRIPT = [
  "The index in a brochure measures a whole market, often before any fees and sometimes without borrowing. It isn't what any one investor earned.",
  "What a client earns depends on the fund's fees, how much it borrows, the cash it holds for redemptions, and the share class they buy.",
  "Here's the index, and here's what each share class of the fund reported for its own period, side by side, with the reasons they differ.",
];

export const IC_IVF = [
  "Is the benchmark in the materials before or after fees, and does it include borrowing?",
  "What does the bridge from that benchmark to our share class look like after fees, leverage and cash?",
  "Are the fund and the benchmark measured over the same period and with the same method?",
];

/** Add-on 1: puts a brochure's index return next to what each share class of the fund actually reported. */
export default function IndexVsFundPage() {
  return (
    <AddonShell
      addonId="index-vs-fund"
      title="Index-to-Fund Translator"
      subtitle="Brochures often show an index return: a whole market, frequently before fees and without borrowing. This puts that index next to what each share class of the fund reported, and lists why the two differ."
      badges={
        <>
          <SampleBadge />
          <span className="text-[11px] text-muted">Index figures are marked sample until checked against the provider&apos;s report. Fund figures are from each 10-Q.</span>
        </>
      }
    >
      <div className="space-y-12">
        <UrlView />
        <ClientScriptCard points={IVF_SCRIPT} icPoints={IC_IVF} />
      </div>
    </AddonShell>
  );
}
