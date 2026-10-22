import { nextUpdate, type Cadence } from "@/lib/schedule";

/** "Next update expected: November 2026", from the SEC filing schedule. The reason shows on hover. */
export default function NextUpdate({ asOf, cadence = "quarterly", className = "" }: { asOf: string; cadence?: Cadence; className?: string }) {
  const n = nextUpdate(asOf, cadence);
  if (!n) return null;
  return (
    <span className={`tnum ${className}`} title={n.basis} data-next-update={n.due}>
      Next update expected: {n.month}
    </span>
  );
}
