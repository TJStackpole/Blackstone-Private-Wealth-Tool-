"use client";

import { useState, type ReactNode } from "react";
import type { FundCode } from "@/config/addons";
import { FUNDS } from "@/lib/addons/shared/funds";
import FundTabs from "@/components/addons/shared/FundTabs";
import { useFundParam } from "@/components/addons/shared/useFundParam";
import FundTax from "./FundTax";
import PrintOnePager from "@/components/addons/shared/PrintOnePager";
import { ADDON_DISCLOSURE } from "@/components/addons/shared/AddonDisclosure";

/** Fund picker for the Tax Lens: BREIT's return-of-capital tools, or how BCRED, BXPE and BX Infra are taxed instead. */
export default function TaxLensFunds({ breit }: { breit: ReactNode }) {
  const linked = useFundParam();
  const [picked, setPicked] = useState<FundCode | null>(null);
  const fund = picked ?? linked ?? "BREIT";
  return (
    <div className="atlas space-y-8" style={{ ["--layer-light" as string]: FUNDS[fund].color, ["--layer-dark" as string]: FUNDS[fund].colorDark }}>
      <div className="no-print">
        <FundTabs value={fund} onChange={setPicked} />
      </div>
      {fund === "BREIT" ? (
        breit
      ) : (
        <PrintOnePager title={`Tax Lens one-pager: ${FUNDS[fund].label}`}>
          <h2 className="hidden font-serif text-xl print:block">Tax Lens: how {FUNDS[fund].label}&apos;s payouts are taxed</h2>
          <FundTax fund={fund} />
          <p className="hidden pt-2 text-[10px] print:block">
            {ADDON_DISCLOSURE} General education, not tax advice; consult a tax advisor. Independent prototype built from public filings. Not affiliated
            with or endorsed by Blackstone.
          </p>
        </PrintOnePager>
      )}
    </div>
  );
}
