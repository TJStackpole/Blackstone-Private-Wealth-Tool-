"use client";

import { useState } from "react";
import type { FundCode } from "@/config/addons";
import { CLAIMS } from "@/lib/addons/reality-check/data";
import { FUNDS } from "@/lib/addons/shared/funds";
import FundTabs from "@/components/addons/shared/FundTabs";
import { useFundParam } from "@/components/addons/shared/useFundParam";
import ClaimCard from "./ClaimCard";

function View({ initial }: { initial: FundCode }) {
  const [fund, setFund] = useState<FundCode>(initial);
  const d = CLAIMS[fund];
  return (
    <div className="atlas space-y-5" style={{ ["--layer-light" as string]: FUNDS[fund].color, ["--layer-dark" as string]: FUNDS[fund].colorDark }}>
      <div className="no-print">
        <FundTabs value={fund} onChange={setFund} />
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
