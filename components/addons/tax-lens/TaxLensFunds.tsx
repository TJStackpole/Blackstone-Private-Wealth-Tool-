"use client";

import { useState, type ReactNode } from "react";
import type { FundCode } from "@/config/addons";
import { FUNDS } from "@/lib/addons/shared/funds";
import FundTabs from "@/components/addons/shared/FundTabs";
import { useFundParam } from "@/components/addons/shared/useFundParam";
import FundTax from "./FundTax";

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
      {fund === "BREIT" ? breit : <FundTax fund={fund} />}
    </div>
  );
}
