"use client";

import { useState } from "react";
import type { FundCode } from "@/config/addons";
import { INDEX_VS_FUND } from "@/lib/addons/index-vs-fund/data";
import { FUNDS } from "@/lib/addons/shared/funds";
import FundTabs from "@/components/addons/shared/FundTabs";
import ComparisonCard from "./ComparisonCard";
import WhyTheyDiffer from "./WhyTheyDiffer";

/** Fund picker, then the comparison card and the reasons, tinted with that fund's accent. */
export default function IndexVsFundView({ initialFund = "BREIT" }: { initialFund?: FundCode }) {
  const [fund, setFund] = useState<FundCode>(initialFund);
  const data = INDEX_VS_FUND[fund];
  return (
    <div className="atlas space-y-10" style={{ ["--layer-light" as string]: FUNDS[fund].color, ["--layer-dark" as string]: FUNDS[fund].colorDark }}>
      <section aria-labelledby="ivf-card-h" className="space-y-4">
        <h2 id="ivf-card-h" className="font-serif text-[22px] font-medium leading-tight text-ink">
          The index next to the fund
        </h2>
        <FundTabs value={fund} onChange={setFund} />
        <ComparisonCard data={data} />
      </section>
      <section aria-labelledby="ivf-why-h" className="space-y-4">
        <h2 id="ivf-why-h" className="font-serif text-[22px] font-medium leading-tight text-ink">
          Why they differ
        </h2>
        <WhyTheyDiffer data={data} />
      </section>
    </div>
  );
}
