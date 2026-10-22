"use client";

import { useState } from "react";
import type { FundCode } from "@/config/addons";
import { CLAIMS } from "@/lib/addons/reality-check/data";
import { FUNDS } from "@/lib/addons/shared/funds";
import FundTabs from "@/components/addons/shared/FundTabs";
import { useFundParam } from "@/components/addons/shared/useFundParam";
import ClaimCard from "./ClaimCard";
import FreshnessBadge from "./FreshnessBadge";

function View({ initial }: { initial: FundCode }) {
  const [fund, setFund] = useState<FundCode>(initial);
  const d = CLAIMS[fund];
  const oldest = d.claims.map((c) => c.asOf).sort()[0];
  return (
    <div className="atlas space-y-5" style={{ ["--layer-light" as string]: FUNDS[fund].color, ["--layer-dark" as string]: FUNDS[fund].colorDark }}>
      <div className="no-print">
        <FundTabs value={fund} onChange={setFund} />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-strong">
        <span>Snapshot age:</span>
        <FreshnessBadge asOf={oldest} />
        <span className="text-muted">Updated {d.updated}. New quarterly filings arrive about six weeks after each quarter ends.</span>
      </div>
      <div className="space-y-3">
        {d.claims.map((c) => (
          <ClaimCard key={c.id} c={c} />
        ))}
      </div>
      <p className="text-[11px] leading-relaxed text-muted">{d.note}</p>
    </div>
  );
}

/** Fund picker and the claim cards, starting on the fund a chip link named. */
export default function ClaimsView() {
  const f = useFundParam();
  return <View key={f ?? "default"} initial={f ?? "BCRED"} />;
}
