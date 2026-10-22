import BuiltBy from "@/components/BuiltBy";

/** Required at the end of every add-on page (Rule 8). The wording is fixed by the plan. */
export const ADDON_DISCLOSURE =
  "Illustrative only. Not investment, tax, or legal advice. Fund terms, fees, and performance vary by share class and change over time; the offering documents control. Past performance does not predict future results.";

export default function AddonDisclosure() {
  return (
    <aside aria-label="Disclosure" className="border-t border-line pt-4 text-xs leading-relaxed text-muted">
      <p>{ADDON_DISCLOSURE}</p>
      <p className="mt-2">
        Independent prototype built from public filings. Not affiliated with or endorsed by Blackstone. <BuiltBy />.
      </p>
    </aside>
  );
}
