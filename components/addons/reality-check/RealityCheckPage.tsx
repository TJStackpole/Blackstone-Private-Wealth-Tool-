import AddonShell from "@/components/addons/shared/AddonShell";
import { CLAIMS } from "@/lib/addons/reality-check/data";
import { formatDate } from "@/lib/aggregate";
import ClaimsView from "./ClaimsView";

const all = Object.values(CLAIMS).flatMap((f) => f.claims);
const latest = all.map((c) => c.asOf).sort().at(-1)!;
const nonAccrual = CLAIMS.BCRED.claims.find((c) => c.id === "bcred-monitoring");

/** Add-on 5: each fund's own stated objectives next to what its filings show. */
export default function RealityCheckPage() {
  return (
    <AddonShell
      addonId="reality-check"
      title="Reality Check"
      subtitle="Each fund's stated goals, next to its latest filing."
      glance={[
        { value: String(all.length), label: `Goals checked across ${Object.keys(CLAIMS).length} funds` },
        // Restates the BCRED claim's value ("15 issuers…, up from 9…"); keep the two in step when the data is updated.
        { value: "9 → 15", label: "BCRED borrowers with loans on non-accrual, Dec 2025 to Jun 2026", source: nonAccrual?.source },
        { value: formatDate(latest), label: "Data as of: each fund's latest quarterly filing" },
      ]}
    >
      <div className="space-y-12">
        <ClaimsView />
      </div>
    </AddonShell>
  );
}
