import AddonShell from "@/components/addons/shared/AddonShell";
import ClientScriptCard from "@/components/addons/shared/ClientScriptCard";
import ClaimsView from "./ClaimsView";

export const RC_SCRIPT = [
  "Each fund states its goals in its own reports. Here are those goals next to what its latest filing shows.",
  "Some line up well; some are worth watching. Seeing both side by side means no surprises in a review.",
  "This is a snapshot from a quarterly filing, dated on every card, and it's updated when the next filing comes out.",
];
export const IC_RC = [
  "How do the fund's stated objectives compare with its recent reported results?",
  "Which items are worth watching, and what would change that view?",
  "How current is this snapshot, and when is the next filing due?",
];

/** Add-on 5: each fund's own stated objectives next to what its filings show. */
export default function RealityCheckPage() {
  return (
    <AddonShell
      addonId="reality-check"
      title="Reality Check"
      subtitle="Each fund's stated objectives, in its own annual report, next to what its latest quarterly filing shows. Labels are neutral and set by a person, not by code."
    >
      <div className="space-y-12">
        <ClaimsView />
        <ClientScriptCard points={RC_SCRIPT} icPoints={IC_RC} />
      </div>
    </AddonShell>
  );
}
