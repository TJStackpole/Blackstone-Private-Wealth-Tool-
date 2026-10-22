import PrintOnePager from "@/components/addons/shared/PrintOnePager";
import { ADDON_DISCLOSURE } from "@/components/addons/shared/AddonDisclosure";
import { HISTORY, TERMS } from "@/lib/addons/liquidity/data";
import { FUNDS } from "@/lib/addons/shared/funds";
import { formatDate } from "@/lib/aggregate";

/** One printed page: each fund's terms, the dated history and the disclosure. Hidden on screen. */
export default function LiquidityPrint() {
  return (
    <PrintOnePager title="Liquidity one-pager" screen={false}>
      <div className="space-y-4 text-xs leading-snug">
        <div>
          <h2 className="font-serif text-xl">Liquidity: how these funds pay out</h2>
          <p>Terms as of {formatDate(TERMS.asOf)}, from each fund&apos;s Form 10-Q. Illustrative; the offering documents control.</p>
        </div>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="py-1 pr-2">Fund</th>
              <th className="py-1 pr-2">How often</th>
              <th className="py-1 pr-2">Limit</th>
              <th className="py-1">Early sale deduction</th>
            </tr>
          </thead>
          <tbody>
            {TERMS.funds.map((f) => (
              <tr key={f.fund} className="border-b align-top">
                <td className="py-1 pr-2">{FUNDS[f.fund].label}</td>
                <td className="py-1 pr-2">{f.howOften}</td>
                <td className="py-1 pr-2">{f.limits.map((l) => `${l.label}: ${l.value}${l.unit}`).join("; ")}</td>
                <td className="py-1">
                  {f.earlyDeduction.value}% if held under {f.earlyDeduction.heldUnder}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <h3 className="font-serif text-sm">When the limits have applied</h3>
          <ul className="list-disc pl-4">
            {HISTORY.events.map((e) => (
              <li key={e.date + e.fund}>
                {formatDate(e.date)} · {e.fund}: {e.title}
              </li>
            ))}
          </ul>
        </div>
        <p className="border-t pt-2 text-[10px]">
          {ADDON_DISCLOSURE} Independent prototype built from public filings. Not affiliated with or endorsed by Blackstone.
        </p>
      </div>
    </PrintOnePager>
  );
}
