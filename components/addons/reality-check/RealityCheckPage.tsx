import AddonShell from "@/components/addons/shared/AddonShell";
import ClaimsView from "./ClaimsView";


/** Add-on 5: each fund's own stated objectives next to what its filings show. */
export default function RealityCheckPage() {
  return (
    <AddonShell
      addonId="reality-check"
      title="Reality Check"
      subtitle="Each fund's own stated goals, next to what its latest filing shows."
      glance={[
        { value: "12", label: "Goals checked, three per fund" },
        { value: "9 → 15", label: "BCRED borrowers with loans on non-accrual, Dec 2025 to Jun 2026" },
        { value: "Jun 30, 2026", label: "Data as of: each fund's latest quarterly filing" },
      ]}
    >
      <div className="space-y-12">
        <ClaimsView />
      </div>
    </AddonShell>
  );
}
